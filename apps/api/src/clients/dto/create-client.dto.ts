import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  tradeName: string;

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
  @IsNotEmpty()
  entryDate: string;

  @IsDateString()
  @IsOptional()
  exitDate?: string;

  @IsString()
  @IsOptional()
  exitReason?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyContractValue?: number;

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

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  driveUrl?: string;

  @IsString()
  @IsOptional()
  clickupUrl?: string;

  @IsString()
  @IsOptional()
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
