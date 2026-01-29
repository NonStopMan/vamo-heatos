import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LeadCreateDto } from './lead-create.dto';
import { ImmoType, OwnershipRelationship } from './enums';

const getConsistencyIssues = (payload: LeadCreateDto): string[] => {
  const issues: string[] = [];
  const immoType = payload.building?.buildingInformation?.immoType;
  if (immoType === ImmoType.Wohnung) {
    const apartmentHeatingSystem =
      payload.building?.energyRelevantInformation?.apartmentHeatingSystem;
    if (!apartmentHeatingSystem) {
      issues.push('apartmentHeatingSystem is required when immoType is Wohnung');
    }
  }

  if (payload.building?.buildingInformation?.hasSolarThermalSystem === true) {
    if (payload.project?.shouldKeepSolarThermalSystem === undefined) {
      issues.push('shouldKeepSolarThermalSystem is required when hasSolarThermalSystem is true');
    }
  }

  const ownershipRelationship = payload.building?.ownershipRelationships?.ownershipRelationship;
  if (
    ownershipRelationship === OwnershipRelationship.Teileigentuemer ||
    ownershipRelationship === OwnershipRelationship.Sonstiges
  ) {
    if (!payload.building?.ownershipRelationships?.ownershipRelationshipExplanation) {
      issues.push('ownershipRelationshipExplanation is required for shared or other ownership');
    }
    if (payload.building?.ownershipRelationships?.numberOfOwners === undefined) {
      issues.push('numberOfOwners is required for shared or other ownership');
    }
  }

  return issues;
};

@ValidatorConstraint({ name: 'LeadCreateConsistency', async: false })
export class LeadCreateConsistencyRule implements ValidatorConstraintInterface {
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const payload = (args?.object ?? {}) as LeadCreateDto;
    return getConsistencyIssues(payload).length === 0;
  }

  defaultMessage(args?: ValidationArguments): string {
    const payload = (args?.object ?? {}) as LeadCreateDto;
    const issues = getConsistencyIssues(payload);
    return issues.join(', ');
  }
}
