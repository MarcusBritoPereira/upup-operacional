import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateActionPlanDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsUUID()
  @IsOptional()
  monthlyCycleId?: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsString()
  @IsOptional()
  probableCause?: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsUUID()
  @IsOptional()
  responsibleId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  learning?: string;

  @IsBoolean()
  @IsOptional()
  canBecomePlaybook?: boolean;
}
