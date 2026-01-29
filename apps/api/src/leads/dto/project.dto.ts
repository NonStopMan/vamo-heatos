import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  AdditionalDisposalItem,
  HouseholdIncome,
  ProjectTimeline,
  StatusOfFoundationConstruction,
} from './enums';
import { ProjectPicturesDto } from './pictures.dto';

export class ProjectDto {
  @IsOptional()
  @IsEnum(ProjectTimeline)
  timeline?: ProjectTimeline;

  @IsOptional()
  @IsEnum(HouseholdIncome)
  householdIncome?: HouseholdIncome;

  @IsOptional()
  @IsEnum(StatusOfFoundationConstruction)
  statusOfFoundationConstruction?: StatusOfFoundationConstruction;

  @IsOptional()
  @IsString()
  infosLeadsource?: string;

  @IsOptional()
  @IsBoolean()
  fullReplacementOfHeatingSystemPlanned?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(AdditionalDisposalItem, { each: true })
  additionalDisposal?: AdditionalDisposalItem[];

  @IsOptional()
  @IsBoolean()
  shouldKeepSolarThermalSystem?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectPicturesDto)
  pictures?: ProjectPicturesDto;
}
