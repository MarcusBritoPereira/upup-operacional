import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { CookieOptions, Request, Response } from 'express';
import { requestIp } from '../audit/audit.utils';
import type { RequestWithAuth } from './interfaces/auth-user.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  private maxAge() {
    const raw = this.config.get<string>('JWT_EXPIRES_IN') ?? '1h';
    const value = Number.parseInt(raw,10);
    return value * (raw.endsWith('d') ? 86400000 : raw.endsWith('m') ? 60000 : 3600000);
  }

  private cookie(): CookieOptions {
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    return {
      httpOnly:true,
      secure:this.config.get<boolean>('COOKIE_SECURE') ?? false,
      sameSite:this.config.get<'lax'|'strict'|'none'>('COOKIE_SAME_SITE') ?? 'lax',
      maxAge:this.maxAge(),path:'/',...(domain ? {domain} : {})
    };
  }

  private context(req: Request) {
    return { ipAddress:requestIp(req), userAgent:req.headers['user-agent'] ?? null };
  }

  @Post('login')
  @Throttle({ default:{limit:5,ttl:60000} })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({passthrough:true}) res: Response) {
    const result = await this.auth.login(dto.email,dto.password,this.context(req));
    res.cookie('upup_token',result.access_token,this.cookie());
    return { user:result.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: RequestWithAuth, @Res({passthrough:true}) res: Response) {
    const result = await this.auth.logout(req.user.id,req.user.sessionId,this.context(req));
    const options = {...this.cookie()}; delete options.maxAge;
    res.clearCookie('upup_token',options);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: RequestWithAuth) {
    return { user:await this.auth.getUserSession(req.user.id) };
  }
}
