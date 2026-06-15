import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyValue: number;

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
