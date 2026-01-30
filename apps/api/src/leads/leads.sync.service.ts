import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CRM_ADAPTER } from './crm.adapter';
import type { CrmAdapter } from './crm.adapter';
import { LEADS_REPOSITORY } from './leads.repository';
import type { LeadsRepository } from './leads.repository';
import type { LeadCreateDto } from './dto';

@Injectable()
export class LeadsSyncService {
  private isRunning = false;
  private readonly maxRetries = 5;
  private readonly logger = new Logger(LeadsSyncService.name);

  constructor(
    @Inject(LEADS_REPOSITORY) private readonly repository: LeadsRepository,
    @Inject(CRM_ADAPTER) private readonly crmAdapter: CrmAdapter,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processNext(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Sync already running; skipping tick');
      return;
    }
    this.isRunning = true;
    try {
      const lead = await this.repository.findNextPending(this.maxRetries);
      if (!lead) {
        return;
      }
      this.logger.log(`Syncing lead to CRM (leadId=${lead.id})`);
      try {
        await this.crmAdapter.forwardLead(lead.payload as unknown as LeadCreateDto);
        await this.repository.markSynced(lead.id);
        this.logger.log(`Lead synced to CRM (leadId=${lead.id})`);
      } catch (error) {
        const rawMessage =
          error instanceof Error ? error.message : 'Unknown CRM error';
        const message = simplifyCrmError(rawMessage);
        const nextRetries = (lead.crmRetries ?? 0) + 1;
        const status = nextRetries >= this.maxRetries ? 'failed' : 'pending';
        await this.repository.markFailed(lead.id, nextRetries, message, status);
        const logMessage = `CRM sync failed (leadId=${lead.id}, retries=${nextRetries}, status=${status}): ${rawMessage}`;
        if (status === 'failed') {
          const stack = error instanceof Error ? error.stack : undefined;
          this.logger.error(logMessage, stack);
        } else {
          this.logger.warn(logMessage);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}

const simplifyCrmError = (message: string): string => {
  const start = message.indexOf('[');
  const end = message.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    return message;
  }

  const jsonText = message.slice(start, end + 1);
  try {
    const parsed = JSON.parse(jsonText) as Array<{ errorCode?: string; message?: string }>;
    const first = parsed[0];
    if (first?.errorCode || first?.message) {
      const code = first.errorCode ?? 'UNKNOWN';
      const msg = first.message ?? 'Unknown CRM error';
      return `${code}: ${msg}`;
    }
  } catch {
    return message;
  }

  return message;
};
