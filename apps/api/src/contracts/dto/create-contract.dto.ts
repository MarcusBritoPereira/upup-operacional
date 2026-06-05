import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsDateString,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
