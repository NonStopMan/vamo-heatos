import { Inject, Injectable } from '@nestjs/common';
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

  constructor(
    @Inject(LEADS_REPOSITORY) private readonly repository: LeadsRepository,
    @Inject(CRM_ADAPTER) private readonly crmAdapter: CrmAdapter,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processNext(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    try {
      const lead = await this.repository.findNextPending(this.maxRetries);
      if (!lead) {
        return;
      }
      try {
        await this.crmAdapter.forwardLead(lead.payload as unknown as LeadCreateDto);
        await this.repository.markSynced(lead.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown CRM error';
        const nextRetries = (lead.crmRetries ?? 0) + 1;
        const status = nextRetries >= this.maxRetries ? 'failed' : 'pending';
        await this.repository.markFailed(lead.id, nextRetries, message, status);
      }
    } finally {
      this.isRunning = false;
    }
  }
}
