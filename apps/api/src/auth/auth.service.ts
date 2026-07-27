import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type Context = { ipAddress: string | null; userAgent: string | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private expiresAt() {
    const raw = this.config.get<string>('JWT_EXPIRES_IN') ?? '1h';
    const value = Number.parseInt(raw,10);
    const ms = raw.endsWith('d') ? 86400000 : raw.endsWith('m') ? 60000 : 3600000;
    return new Date(Date.now() + value * ms);
  }

  async login(email: string, password: string, context: Context) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: normalized, mode: 'insensitive' } }
    });

    if (!user || !user.isActive) {
      await this.prisma.loginAuditLog.create({ data: {
        email: normalized, success: false,
        ipAddress: context.ipAddress, userAgent: context.userAgent,
        failureReason: !user ? 'Usuário não encontrado' : 'Usuário inativo'
      }});
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      await this.prisma.loginAuditLog.create({ data: {
        userId: user.id, email: user.email, success: false,
        ipAddress: context.ipAddress, userAgent: context.userAgent,
        failureReason: 'Senha inválida'
      }});
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const now = new Date();
    const sessionId = randomUUID();

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: {
        lastLoginAt: now, lastLoginIp: context.ipAddress,
        lastLoginUserAgent: context.userAgent
      }}),
      this.prisma.userSession.create({ data: {
        id: sessionId, userId: user.id, ipAddress: context.ipAddress,
        userAgent: context.userAgent, expiresAt: this.expiresAt()
      }}),
      this.prisma.loginAuditLog.create({ data: {
        userId: user.id, email: user.email, success: true,
        ipAddress: context.ipAddress, userAgent: context.userAgent
      }})
    ]);

    return {
      access_token: this.jwtService.sign({
        sub: user.id, email: user.email, role: user.role, sid: sessionId
      }),
      user: {
        id:user.id,name:user.name,email:user.email,phone:user.phone,
        avatarUrl:user.avatarUrl,role:user.role,department:user.department,
        position:user.position,lastLoginAt:now
      }
    };
  }

  async logout(userId: string, sessionId: string | undefined, context: Context) {
    if (sessionId) {
      await this.prisma.userSession.updateMany({
        where: { id: sessionId, userId, loggedOutAt: null },
        data: { loggedOutAt: new Date() }
      });
    }

    await this.prisma.activityAuditLog.create({ data: {
      userId, action:'LOGOUT', entityType:'user_session',
      entityId:sessionId ?? null, description:'Usuário saiu do sistema',
      method:'POST', path:'/auth/logout', statusCode:200,
      ipAddress:context.ipAddress,userAgent:context.userAgent
    }});

    return { success:true };
  }

  async getUserSession(id: string) {
    const user = await this.prisma.user.findUnique({
      where:{id},
      select:{
        id:true,name:true,email:true,phone:true,avatarUrl:true,role:true,
        department:true,position:true,isActive:true,lastLoginAt:true,
        lastLoginIp:true,lastLoginUserAgent:true
      }
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Usuário não encontrado ou inativo');
    return user;
  }
}
