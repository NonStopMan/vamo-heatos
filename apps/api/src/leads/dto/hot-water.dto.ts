import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ShowerType } from './enums';

export class HotWaterDto {
  @IsOptional()
  @IsNumber()
  numberOfBathtubs?: number;

  @IsOptional()
  @IsNumber()
  numberOfShowers?: number;

  @IsOptional()
  @IsEnum(ShowerType)
  typeOfShowers?: ShowerType;
}
