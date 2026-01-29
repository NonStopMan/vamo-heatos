import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OwnershipRelationship, OwnershipType } from './enums';

export class OwnershipRelationshipsDto {
  @IsOptional()
  @IsEnum(OwnershipRelationship)
  ownershipRelationship?: OwnershipRelationship;

  @IsOptional()
  @IsString()
  ownershipRelationshipExplanation?: string;

  @IsOptional()
  @IsNumber()
  numberOfOwners?: number;

  @IsOptional()
  @IsBoolean()
  ownerOccupiedHousing?: boolean;

  @IsOptional()
  @IsEnum(OwnershipType)
  type?: OwnershipType;
}
