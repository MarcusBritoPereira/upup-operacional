import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6, { message: 'A senha atual deve ter no mínimo 6 caracteres.' })
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  newPassword!: string;
}
