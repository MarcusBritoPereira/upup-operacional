import { IsInt, IsOptional, IsString, Min } from 'class-validator';

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
