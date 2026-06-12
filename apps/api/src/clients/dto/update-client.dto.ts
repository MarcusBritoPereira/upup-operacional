import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEmail,
  IsEnum,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  tradeName?: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  segment?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @IsDateString()
  @IsOptional()
  entryDate?: string;

  @IsDateString()
  @IsOptional()
  exitDate?: string;

  @IsString()
  @IsOptional()
  exitReason?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsUUID()
  @IsOptional()
  squadId?: string;

  @IsString()
  @IsOptional()
  decisionMakerName?: string;

  @IsString()
  @IsOptional()
  decisionMakerPhone?: string;

  @IsEmail()
  @IsOptional()
  decisionMakerEmail?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  instagramUrl?: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  driveUrl?: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  clickupUrl?: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  whatsappGroupUrl?: string;

  @IsString()
  @IsOptional()
  clientProfile?: string;

  @IsString()
  @IsOptional()
  marketingMaturity?: string;

  @IsString()
  @IsOptional()
  strategicNotes?: string;
}
