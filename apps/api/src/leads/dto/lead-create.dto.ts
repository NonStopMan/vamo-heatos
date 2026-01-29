import { Type } from 'class-transformer';
import { IsDefined, IsIn, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { BuildingDto } from './building.dto';
import { ContactDto } from './contact.dto';
import { HeatingSystemDto } from './heating-system.dto';
import { ProjectDto } from './project.dto';
import { LeadCreateConsistencyRule } from './lead-create.validator';

export class LeadCreateDto {
  @IsDefined()
  @IsIn(['1.2.0'])
  @Validate(LeadCreateConsistencyRule)
  version!: '1.2.0';

  @IsOptional()
  @IsString()
  id?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ContactDto)
  contact!: ContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BuildingDto)
  building?: BuildingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HeatingSystemDto)
  heatingSystem?: HeatingSystemDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectDto)
  project?: ProjectDto;
}
