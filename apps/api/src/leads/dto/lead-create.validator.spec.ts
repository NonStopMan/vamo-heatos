import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ImmoType,
  LeadCreateDto,
  OwnershipRelationship,
} from './index';

const basePayload = (): LeadCreateDto => ({
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

describe('LeadCreateConsistencyRule', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('flags missing apartmentHeatingSystem for Wohnung', async () => {
    const payload: LeadCreateDto = {
      ...basePayload(),
      building: {
        buildingInformation: {
          immoType: ImmoType.Wohnung,
        },
        energyRelevantInformation: {},
      },
    };

    const errors = await validate(plainToInstance(LeadCreateDto, payload));
    expect(errors.some((error) => error.constraints?.LeadCreateConsistency)).toBe(true);
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it('flags missing ownership details for shared ownership', async () => {
    const payload: LeadCreateDto = {
      ...basePayload(),
      building: {
        ownershipRelationships: {
          ownershipRelationship: OwnershipRelationship.Teileigentuemer,
        },
      },
    };

    const errors = await validate(plainToInstance(LeadCreateDto, payload));
    expect(errors.some((error) => error.constraints?.LeadCreateConsistency)).toBe(true);
  });

  it('accepts localhost URLs for picture uploads', async () => {
    const payload: LeadCreateDto = {
      ...basePayload(),
      project: {
        pictures: {
          outdoorUnitLocation: [
            {
              url: 'http://localhost:3000/uploads/test.jpeg',
            },
          ],
        },
      },
    };

    const errors = await validate(plainToInstance(LeadCreateDto, payload));
    expect(errors.length).toBe(0);
  });
});
