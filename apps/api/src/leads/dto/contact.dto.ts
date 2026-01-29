import { Type } from 'class-transformer';
import { IsDefined, IsOptional, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';
import { ContactInformationDto } from './contact-information.dto';
import { MarketingDto } from './marketing.dto';

export class ContactDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ContactInformationDto)
  contactInformation!: ContactInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MarketingDto)
  marketing?: MarketingDto;
}
