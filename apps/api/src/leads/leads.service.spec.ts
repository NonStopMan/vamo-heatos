import { ConflictException, Logger } from '@nestjs/common';
import {
  AdditionalDisposalItem,
  ConsumptionUnit,
  GroundingType,
  HouseholdIncome,
  HeatingSystemType,
  ImmoType,
  LeadCreateDto,
  ProjectTimeline,
  StatusOfFoundationConstruction,
} from './dto';
import { LEADS_REPOSITORY, LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

const buildMinimalPayload = (): LeadCreateDto => ({
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

describe('LeadsService', () => {
  const repository: jest.Mocked<LeadsRepository> = {
    findByExternalId: jest.fn(),
    createLead: jest.fn(),
    findNextPending: jest.fn(),
    markSynced: jest.fn(),
    markFailed: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    repository.findByExternalId.mockReset();
    repository.createLead.mockReset();
    repository.findNextPending.mockReset();
    repository.markSynced.mockReset();
    repository.markFailed.mockReset();
    repository.createLead.mockResolvedValue({ id: 'lead-1' } as never);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a lead and returns qualification by default', async () => {
    repository.findByExternalId.mockResolvedValue(null);
    const service = new LeadsService(repository);
    const result = await service.createLead(buildMinimalPayload());

    expect(result.leadStage).toBe('qualification');
    expect(repository.createLead).toHaveBeenCalledTimes(1);
  });

  it('throws conflict when external id exists', async () => {
    repository.findByExternalId.mockResolvedValue({} as never);
    const service = new LeadsService(repository);

    await expect(
      service.createLead({ ...buildMinimalPayload(), id: 'existing' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it('logs error when persistence fails', async () => {
    repository.findByExternalId.mockResolvedValue(null);
    repository.createLead.mockRejectedValue(new Error('db down'));
    const service = new LeadsService(repository);

    await expect(service.createLead(buildMinimalPayload())).rejects.toThrow('db down');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('returns discovery when discovery fields are present', async () => {
    repository.findByExternalId.mockResolvedValue(null);
    const service = new LeadsService(repository);

    const payload: LeadCreateDto = {
      ...buildMinimalPayload(),
      building: {
        buildingInformation: {
          immoType: ImmoType.EinfamilienhausZweifamilienhaus,
          livingSpace: 180,
          residentialUnits: 1,
          groundingType: GroundingType.GroundingSpikeOrFoundation,
          hasSolarThermalSystem: false,
        },
        ownershipRelationships: {
          ownerOccupiedHousing: true,
        },
      },
      heatingSystem: {
        systemType: HeatingSystemType.Erdgas,
        consumption: 9000,
        consumptionUnit: ConsumptionUnit.Kilowattstunden,
      },
      project: {
        timeline: ProjectTimeline.ThreeToSixMonths,
        fullReplacementOfHeatingSystemPlanned: true,
      },
    };

    const result = await service.createLead(payload);
    expect(result.leadStage).toBe('discovery');
  });

  it('returns selling when selling fields and pictures are present', async () => {
    repository.findByExternalId.mockResolvedValue(null);
    const service = new LeadsService(repository);

    const payload: LeadCreateDto = {
      ...buildMinimalPayload(),
      building: {
        buildingInformation: {
          immoType: ImmoType.EinfamilienhausZweifamilienhaus,
          livingSpace: 180,
          residentialUnits: 1,
          groundingType: GroundingType.GroundingSpikeOrFoundation,
          hasSolarThermalSystem: false,
        },
        ownershipRelationships: {
          ownerOccupiedHousing: true,
        },
      },
      heatingSystem: {
        systemType: HeatingSystemType.Erdgas,
        consumption: 9000,
        consumptionUnit: ConsumptionUnit.Kilowattstunden,
      },
      project: {
        timeline: ProjectTimeline.ThreeToSixMonths,
        fullReplacementOfHeatingSystemPlanned: true,
        householdIncome: HouseholdIncome.MoreThan40kGross,
        statusOfFoundationConstruction: StatusOfFoundationConstruction.Vamo,
        additionalDisposal: [AdditionalDisposalItem.Heatpump],
        pictures: {
          outdoorUnitLocation: [{ url: 'https://example.com/outdoor.jpg' }],
        },
      },
    };

    const result = await service.createLead(payload);
    expect(result.leadStage).toBe('selling');
  });

});
