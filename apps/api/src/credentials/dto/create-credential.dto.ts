import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCredentialDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  systemName: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
