import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsDateString,
  IsEmail,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  status?: string;

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
