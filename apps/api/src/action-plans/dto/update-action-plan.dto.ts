import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdateActionPlanDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsUUID()
  @IsOptional()
  monthlyCycleId?: string;

  @IsString()
  @IsOptional()
  problem?: string;

  @IsString()
  @IsOptional()
  probableCause?: string;

  @IsString()
  @IsOptional()
  action?: string;

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
