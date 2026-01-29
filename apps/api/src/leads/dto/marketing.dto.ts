import { IsOptional, IsString } from 'class-validator';

export class MarketingDto {
  @IsOptional()
  @IsString()
  customerLoyaltyProgramType?: string;

  @IsOptional()
  @IsString()
  customerLoyaltyProgramId?: string;
}
