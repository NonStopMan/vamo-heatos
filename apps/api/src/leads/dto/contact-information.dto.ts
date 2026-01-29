import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Salutation } from './enums';

export class ContactInformationDto {
  @IsOptional()
  @IsEnum(Salutation)
  salutation?: Salutation;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsBoolean()
  newsletterSingleOptIn?: boolean;
}
