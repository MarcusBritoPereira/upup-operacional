import { Body, Controller, Post, HttpCode, HttpStatus, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private getCookieMaxAge(): number {
    const expires = this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
    const value = parseInt(expires, 10);
    if (expires.endsWith('d')) {
      return value * 24 * 60 * 60 * 1000;
    }
    if (expires.endsWith('h')) {
      return value * 60 * 60 * 1000;
    }
    if (expires.endsWith('m')) {
      return value * 60 * 1000;
    }
    return 60 * 60 * 1000; // 1 hora
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    
    res.cookie('upup_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.getCookieMaxAge(),
      path: '/',
    });

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('upup_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = await this.authService.getUserSession(req.user.id);
    return { user };
  }
}
