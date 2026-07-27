import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCredentialDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  systemName: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  url?: string;

  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
