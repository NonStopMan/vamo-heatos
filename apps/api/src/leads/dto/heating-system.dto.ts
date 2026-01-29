import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  ConsumptionUnit,
  DomesticHotWaterCirculationPump,
  DomesticWaterStation,
  HeatingSystemType,
} from './enums';

export class HeatingSystemDto {
  @IsOptional()
  @IsNumber()
  consumption?: number;

  @IsOptional()
  @IsEnum(ConsumptionUnit)
  consumptionUnit?: ConsumptionUnit;

  @IsOptional()
  @IsEnum(HeatingSystemType)
  systemType?: HeatingSystemType;

  @IsOptional()
  @IsNumber()
  @Min(1500)
  constructionYearHeatingSystem?: number;

  @IsOptional()
  @IsString()
  constructionYearHeatingSystemString?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsBoolean()
  floorHeatingConnectedToReturnPipe?: boolean;

  @IsOptional()
  @IsBoolean()
  floorHeatingOwnHeatingCircuit?: boolean;

  @IsOptional()
  @IsBoolean()
  floorHeatingOnlyInSmallRooms?: boolean;

  @IsOptional()
  @IsNumber()
  numberOfFloorHeatingDistributors?: number;

  @IsOptional()
  @IsNumber()
  numberOfRadiators?: number;

  @IsOptional()
  @IsBoolean()
  domesticHotWaterByHeatpump?: boolean;

  @IsOptional()
  @IsEnum(DomesticHotWaterCirculationPump)
  domesticHotWaterCirculationPump?: DomesticHotWaterCirculationPump;

  @IsOptional()
  @IsEnum(DomesticWaterStation)
  domestic_water_station?: DomesticWaterStation;
}
