import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class UpdateContractDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  monthlyValue?: number;

  @IsNumber()
  @IsOptional()
  taxPercentage?: number;

  @IsNumber()
  @IsOptional()
  geePercentage?: number;

  @IsNumber()
  @IsOptional()
  geeFixedValue?: number;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;
}
