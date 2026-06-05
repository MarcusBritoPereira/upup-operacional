import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class UpdateContractDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  monthlyValue?: number;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
