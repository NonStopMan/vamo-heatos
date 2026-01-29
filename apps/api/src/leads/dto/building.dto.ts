import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';
import { BuildingInformationDto } from './building-information.dto';
import { EnergyRelevantInformationDto } from './energy-relevant-information.dto';
import { HotWaterDto } from './hot-water.dto';
import { OwnershipRelationshipsDto } from './ownership-relationships.dto';

export class BuildingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuildingInformationDto)
  buildingInformation?: BuildingInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OwnershipRelationshipsDto)
  ownershipRelationships?: OwnershipRelationshipsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EnergyRelevantInformationDto)
  energyRelevantInformation?: EnergyRelevantInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HotWaterDto)
  hotWater?: HotWaterDto;
}
