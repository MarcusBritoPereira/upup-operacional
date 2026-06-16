import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContractDeliverableDto {
  @IsUUID()
  deliverableTypeId: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateContractDeliverablesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractDeliverableDto)
  deliverables: ContractDeliverableDto[];
}
