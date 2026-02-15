import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { LeadCreateDto } from './dto';
import { LEADS_REPOSITORY } from './leads.repository';
import type { LeadsRepository } from './leads.repository';
import { LeadCreationResult, LeadRequestContext } from './leads.types';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @Inject(LEADS_REPOSITORY) private readonly repository: LeadsRepository,
  ) {}

  async createLead(
    payload: LeadCreateDto,
    context: LeadRequestContext = {},
  ): Promise<LeadCreationResult> {
    let leadId = payload.id ?? 'unknown';
    this.logger.log(
      `Creating lead (leadId=${leadId}, requestId=${context.requestId ?? 'unknown'})`,
    );

    if (payload.id) {
      const existing = await this.repository.findByExternalId(payload.id);
      if (existing) {
        this.logger.warn(`Lead already exists (leadId=${payload.id})`);
        throw new ConflictException({
          reason: 'Already Exists',
          issues: ['lead already exists'],
        });
      }
    }

    try {
      const createdLead = await this.repository.createLead(
        payload.id,
        payload as unknown as Record<string, unknown>,
        context,
      );
      leadId = createdLead.id;
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to persist lead (leadId=${leadId}, requestId=${context.requestId ?? 'unknown'})`,
        stack,
      );
      throw error;
    }

    const leadStage = this.calculateLeadStage(payload);
    this.logger.log(
      `Lead created (leadId=${leadId}, stage=${leadStage}, requestId=${context.requestId ?? 'unknown'})`,
    );
    return {
      leadStage,
      dataAcquisitionLink:
        leadStage === 'selling' ? null : 'https://www.vamo-energy.com/rechner',
      appointmentBookingLink:
        leadStage === 'selling' ? 'https://www.vamo-energy.com/termin' : null,
    };
  }

  private calculateLeadStage(
    payload: LeadCreateDto,
  ): LeadCreationResult['leadStage'] {
    const hasDiscoveryData =
      !!payload.building?.buildingInformation?.immoType &&
      payload.building.buildingInformation.livingSpace !== undefined &&
      payload.building.buildingInformation.residentialUnits !== undefined &&
      !!payload.building.buildingInformation.groundingType &&
      payload.building.buildingInformation.hasSolarThermalSystem !==
        undefined &&
      payload.building.ownershipRelationships?.ownerOccupiedHousing !==
        undefined &&
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
        payload.building?.buildingInformation?.hasSolarThermalSystem ===
          false) &&
      !!payload.project.pictures?.outdoorUnitLocation?.length;

    return hasSellingData ? 'selling' : 'discovery';
  }
}
