import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { LeadCreateDto } from './dto';
import { LEADS_REPOSITORY } from './leads.repository';
import type { LeadsRepository } from './leads.repository';
import { LeadCreationResult } from './leads.types';

@Injectable()
export class LeadsService {
  constructor(@Inject(LEADS_REPOSITORY) private readonly repository: LeadsRepository) {}

  async createLead(payload: LeadCreateDto): Promise<LeadCreationResult> {
    if (payload.id) {
      const existing = await this.repository.findByExternalId(payload.id);
      if (existing) {
        throw new ConflictException({
          reason: 'Already Exists',
          issues: ['lead already exists'],
        });
      }
    }

    await this.repository.createLead(payload.id, payload as unknown as Record<string, unknown>);

    const leadStage = this.calculateLeadStage(payload);
    return {
      leadStage,
      dataAcquisitionLink:
        leadStage === 'selling' ? null : 'https://www.vamo-energy.com/rechner',
      appointmentBookingLink:
        leadStage === 'selling' ? 'https://www.vamo-energy.com/termin' : null,
    };
  }

  private calculateLeadStage(payload: LeadCreateDto): LeadCreationResult['leadStage'] {
    const hasDiscoveryData =
      !!payload.building?.buildingInformation?.immoType &&
      payload.building.buildingInformation.livingSpace !== undefined &&
      payload.building.buildingInformation.residentialUnits !== undefined &&
      !!payload.building.buildingInformation.groundingType &&
      payload.building.buildingInformation.hasSolarThermalSystem !== undefined &&
      payload.building.ownershipRelationships?.ownerOccupiedHousing !== undefined &&
      !!payload.heatingSystem?.systemType &&
      payload.heatingSystem.consumption !== undefined &&
      !!payload.heatingSystem.consumptionUnit &&
      !!payload.project?.timeline &&
      payload.project.fullReplacementOfHeatingSystemPlanned !== undefined;

    if (!hasDiscoveryData) {
      return 'qualification';
    }

    const hasSellingData =
      payload.project?.householdIncome !== undefined &&
      payload.project.statusOfFoundationConstruction !== undefined &&
      payload.project.additionalDisposal !== undefined &&
      (payload.project.shouldKeepSolarThermalSystem !== undefined ||
        payload.building?.buildingInformation?.hasSolarThermalSystem === false) &&
      !!payload.project.pictures?.outdoorUnitLocation?.length;

    return hasSellingData ? 'selling' : 'discovery';
  }

}
