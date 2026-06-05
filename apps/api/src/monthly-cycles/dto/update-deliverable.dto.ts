import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { DeliverableStatus } from '@prisma/client';

export class UpdateDeliverableDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  contractedQuantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  deliveredQuantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  inProgressQuantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  delayedQuantity?: number;

  @IsEnum(DeliverableStatus)
  @IsOptional()
  status?: DeliverableStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
