import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateFollowupDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsUUID()
  @IsNotEmpty()
  monthlyCycleId: string;

  @IsDateString()
  @IsNotEmpty()
  weekStart: string;

  @IsDateString()
  @IsNotEmpty()
  weekEnd: string;

  @IsString()
  @IsOptional()
  groupActivated?: string;

  @IsString()
  @IsOptional()
  clientResponded?: string;

  @IsString()
  @IsOptional()
  agencyRespondedOnTime?: string;

  @IsString()
  @IsOptional()
  calendarOnTrack?: string;

  @IsBoolean()
  @IsOptional()
  hasDelayedDelivery?: boolean;

  @IsBoolean()
  @IsOptional()
  clientShowedDissatisfaction?: boolean;

  @IsString()
  @IsOptional()
  churnRisk?: string;

  @IsString()
  @IsOptional()
  managerNotes?: string;

  @IsString()
  @IsOptional()
  recommendedAction?: string;

  @IsNumber()
  @IsOptional()
  contentGeneratedQuantity?: number;
}
