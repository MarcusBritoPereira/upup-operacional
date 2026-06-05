import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ActionPlanPriority, ActionPlanStatus } from '@prisma/client';

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

  @IsEnum(ActionPlanPriority)
  @IsOptional()
  priority?: ActionPlanPriority;

  @IsEnum(ActionPlanStatus)
  @IsOptional()
  status?: ActionPlanStatus;

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
