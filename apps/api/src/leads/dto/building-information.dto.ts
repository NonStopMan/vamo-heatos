import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BoilerRoomSize,
  BuildingLevelLocation,
  GroundingType,
  ImmoType,
  InstallationLocationCeilingHeight,
  RoomsBetweenHeatingRoomAndOutdoorUnit,
  YesNo,
} from './enums';

export class BuildingInformationDto {
  @IsOptional()
  @IsEnum(ImmoType)
  immoType?: ImmoType;

  @IsOptional()
  @IsEnum(YesNo)
  heritageProtection?: YesNo;

  @IsOptional()
  @IsNumber()
  constructionYear?: number;

  @IsOptional()
  @IsNumber()
  livingSpace?: number;

  @IsOptional()
  @IsString()
  constructionYearString?: string;

  @IsOptional()
  @IsNumber()
  residentialUnits?: number;

  @IsOptional()
  @IsEnum(BoilerRoomSize)
  boilerRoomSize?: BoilerRoomSize;

  @IsOptional()
  @IsEnum(InstallationLocationCeilingHeight)
  installationLocationCeilingHeight?: InstallationLocationCeilingHeight;

  @IsOptional()
  @IsEnum(YesNo)
  widthPathway?: YesNo;

  @IsOptional()
  @IsEnum(YesNo)
  heightPathway?: YesNo;

  @IsOptional()
  @IsEnum(RoomsBetweenHeatingRoomAndOutdoorUnit)
  roomsBetweenHeatingRoomAndOutdoorUnit?: RoomsBetweenHeatingRoomAndOutdoorUnit;

  @IsOptional()
  @IsEnum(BuildingLevelLocation)
  meterClosetLocation?: BuildingLevelLocation;

  @IsOptional()
  @IsEnum(BuildingLevelLocation)
  electricityConnectionLocation?: BuildingLevelLocation;

  @IsOptional()
  @IsEnum(GroundingType)
  groundingType?: GroundingType;

  @IsOptional()
  @IsBoolean()
  hasSolarThermalSystem?: boolean;

  @IsOptional()
  @IsNumber()
  personsHousehold?: number;
}
