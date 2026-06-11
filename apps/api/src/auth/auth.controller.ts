import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieMaxAge(): number {
    const expires = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h';
    const value = Number.parseInt(expires, 10);
    const multipliers = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[expires.at(-1) as keyof typeof multipliers];
  }

  private getCookieOptions(): CookieOptions {
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    return {
      httpOnly: true,
      secure: this.configService.get<boolean>('COOKIE_SECURE') ?? false,
      sameSite:
        this.configService.get<'lax' | 'strict' | 'none'>('COOKIE_SAME_SITE') ??
        'lax',
      maxAge: this.getCookieMaxAge(),
      path: '/',
      ...(domain ? { domain } : {}),
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('upup_token', result.access_token, this.getCookieOptions());

    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    const clearOptions = { ...this.getCookieOptions() };
    delete clearOptions.maxAge;
    res.clearCookie('upup_token', clearOptions);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: { user: { id: string } }) {
    const user = await this.authService.getUserSession(req.user.id);
    return { user };
  }
}
