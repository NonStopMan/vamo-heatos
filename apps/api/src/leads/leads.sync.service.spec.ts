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
    repository.findNextPending.mockReset();
    repository.markSynced.mockReset();
    repository.markFailed.mockReset();
    crmAdapter.forwardLead.mockReset();
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
  });
});
