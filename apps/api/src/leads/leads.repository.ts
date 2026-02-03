import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './lead.schema';

export const LEADS_REPOSITORY = 'LEADS_REPOSITORY';

export interface LeadsRepository {
  findByExternalId(externalId: string): Promise<LeadDocument | null>;
  createLead(
    externalId: string | undefined,
    payload: Record<string, unknown>,
    context?: { requestId?: string; sourceIp?: string; userAgent?: string },
  ): Promise<LeadDocument>;
  findNextPending(maxRetries: number): Promise<LeadDocument | null>;
  markSynced(id: string): Promise<void>;
  markFailed(
    id: string,
    nextRetries: number,
    errorMessage: string,
    status: 'pending' | 'failed',
  ): Promise<void>;
}

export class MongooseLeadsRepository implements LeadsRepository {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  async findByExternalId(externalId: string): Promise<LeadDocument | null> {
    return this.leadModel.findOne({ externalId }).exec();
  }

  async createLead(
    externalId: string | undefined,
    payload: Record<string, unknown>,
    context?: { requestId?: string; sourceIp?: string; userAgent?: string },
  ): Promise<LeadDocument> {
    return this.leadModel.create({
      externalId,
      payload,
      requestId: context?.requestId,
      sourceIp: context?.sourceIp,
      userAgent: context?.userAgent,
    });
  }

  async findNextPending(maxRetries: number): Promise<LeadDocument | null> {
    return this.leadModel
      .findOne({ crmStatus: 'pending', crmRetries: { $lt: maxRetries } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markSynced(id: string): Promise<void> {
    await this.leadModel
      .updateOne(
        { _id: id },
        {
          $set: {
            crmStatus: 'synced',
            crmSyncedAt: new Date(),
            crmLastAttemptAt: new Date(),
            crmLastError: null,
          },
        },
      )
      .exec();
  }

  async markFailed(
    id: string,
    nextRetries: number,
    errorMessage: string,
    status: 'pending' | 'failed',
  ): Promise<void> {
    await this.leadModel
      .updateOne(
        { _id: id },
        {
          $set: {
            crmStatus: status,
            crmRetries: nextRetries,
            crmLastError: errorMessage,
            crmLastAttemptAt: new Date(),
          },
        },
      )
      .exec();
  }
}
