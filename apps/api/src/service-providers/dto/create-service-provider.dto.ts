import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateServiceProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
