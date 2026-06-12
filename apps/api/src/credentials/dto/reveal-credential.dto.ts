import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RevealCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
