import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApartmentHeatingSystem, LocationHeating, TypeOfHeating } from './enums';

export class EnergyRelevantInformationDto {
  @IsOptional()
  @IsNumber()
  heatedArea?: number;

  @IsOptional()
  @IsString()
  heatedAreaString?: string;

  @IsOptional()
  @IsEnum(TypeOfHeating)
  typeOfHeating?: TypeOfHeating;

  @IsOptional()
  @IsEnum(LocationHeating)
  locationHeating?: LocationHeating;

  @IsOptional()
  @IsEnum(ApartmentHeatingSystem)
  apartmentHeatingSystem?: ApartmentHeatingSystem;
}
