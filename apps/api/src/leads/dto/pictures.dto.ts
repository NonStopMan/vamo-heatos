import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUrl, ValidateNested } from 'class-validator';

export class PictureDto {
  @IsUrl({ require_tld: false })
  url!: string;
}

export class ProjectPicturesDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  outdoorUnitLocation?: PictureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  outdoorUnitLocationWithArea?: PictureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  heatingRoom?: PictureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  meterClosetWithDoorOpen?: PictureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  meterClosetSlsSwitchDetailed?: PictureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  floorHeatingDistributionWithDoorOpen?: PictureDto[];
}
