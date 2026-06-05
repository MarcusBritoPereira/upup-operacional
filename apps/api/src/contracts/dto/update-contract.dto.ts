import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
