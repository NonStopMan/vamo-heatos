import { Logger } from '@nestjs/common';
import { LeadsSyncService } from './leads.sync.service';
import type { LeadsRepository } from './leads.repository';
import type { CrmAdapter } from './crm.adapter';

describe('LeadsSyncService', () => {
  const repository: jest.Mocked<LeadsRepository> = {
    findByExternalId: jest.fn(),
    createLead: jest.fn(),
    findNextPending: jest.fn(),
    markSynced: jest.fn(),
    markFailed: jest.fn(),
  };

  const crmAdapter: jest.Mocked<CrmAdapter> = {
    forwardLead: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    repository.findNextPending.mockReset();
    repository.markSynced.mockReset();
    repository.markFailed.mockReset();
    crmAdapter.forwardLead.mockReset();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks lead as synced on successful push', async () => {
    repository.findNextPending.mockResolvedValue({
      id: 'lead-1',
      payload: { version: '1.2.0', contact: { contactInformation: {} } },
      crmRetries: 0,
    } as never);
    crmAdapter.forwardLead.mockResolvedValue(undefined);

    const service = new LeadsSyncService(repository, crmAdapter);
    await service.processNext();

    expect(crmAdapter.forwardLead).toHaveBeenCalledTimes(1);
    expect(repository.markSynced).toHaveBeenCalledWith('lead-1');
    expect(repository.markFailed).not.toHaveBeenCalled();
  });

  it('records failure and increments retries', async () => {
    repository.findNextPending.mockResolvedValue({
      id: 'lead-2',
      payload: { version: '1.2.0', contact: { contactInformation: {} } },
      crmRetries: 1,
    } as never);
    crmAdapter.forwardLead.mockRejectedValue(new Error('crm down'));

    const service = new LeadsSyncService(repository, crmAdapter);
    await service.processNext();

    expect(repository.markFailed).toHaveBeenCalledWith(
      'lead-2',
      2,
      'crm down',
      'pending',
    );
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it('logs error when max retries reached', async () => {
    repository.findNextPending.mockResolvedValue({
      id: 'lead-3',
      payload: { version: '1.2.0', contact: { contactInformation: {} } },
      crmRetries: 4,
    } as never);
    crmAdapter.forwardLead.mockRejectedValue(new Error('salesforce down'));

    const service = new LeadsSyncService(repository, crmAdapter);
    await service.processNext();

    expect(repository.markFailed).toHaveBeenCalledWith(
      'lead-3',
      5,
      'salesforce down',
      'failed',
    );
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('stores simplified Salesforce error details', async () => {
    repository.findNextPending.mockResolvedValue({
      id: 'lead-4',
      payload: { version: '1.2.0', contact: { contactInformation: {} } },
      crmRetries: 0,
    } as never);
    crmAdapter.forwardLead.mockRejectedValue(
      new Error(
        'Salesforce lead create failed: 400 [{"errorCode":"DUPLICATES_DETECTED","message":"Use one of these records?"}]',
      ),
    );

    const service = new LeadsSyncService(repository, crmAdapter);
    await service.processNext();

    expect(repository.markFailed).toHaveBeenCalledWith(
      'lead-4',
      1,
      'DUPLICATES_DETECTED: Use one of these records?',
      'pending',
    );
  });
});
