import { Test } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LEADS_REPOSITORY, LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

describe('LeadsController', () => {
  let controller: LeadsController;

  beforeEach(async () => {
    const repository: LeadsRepository = {
      findByExternalId: jest.fn().mockResolvedValue(null),
      createLead: jest.fn().mockResolvedValue({ id: 'lead-1' } as never),
      findNextPending: jest.fn().mockResolvedValue(null),
      markSynced: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        LeadsService,
        {
          provide: LEADS_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    controller = moduleRef.get(LeadsController);
  });

  it('returns a qualification response on create', async () => {
    const result = await controller.createLead({
      version: '1.2.0',
      contact: {
        contactInformation: {
          firstName: 'First',
          lastName: 'Last',
          phone: '+49 00000000000',
          email: 'email@example.com',
        },
      },
    });
    expect(result).toEqual({
      leadStage: 'qualification',
      dataAcquisitionLink: 'https://www.vamo-energy.com/rechner',
      appointmentBookingLink: null,
    });
  });
});
