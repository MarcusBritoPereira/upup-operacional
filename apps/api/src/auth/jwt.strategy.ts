import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest:ExtractJwt.fromExtractors([
        (req:Request) => req?.cookies?.['upup_token'] as string ?? null
      ]),
      ignoreExpiration:false,
      secretOrKey:config.get<string>('JWT_SECRET')!
    });
  }

  async validate(payload:{sub:string;email:string;role:string;sid?:string}) {
    const user = await this.prisma.user.findUnique({ where:{id:payload.sub} });
    if (!user || !user.isActive) throw new UnauthorizedException('Usuário inativo ou não encontrado');

    if (payload.sid) {
      const session = await this.prisma.userSession.findUnique({ where:{id:payload.sid} });
      if (!session || session.userId !== user.id || session.revokedAt
        || session.loggedOutAt || session.expiresAt <= new Date()) {
        throw new UnauthorizedException('Sessão inválida ou encerrada');
      }
      if (session.lastSeenAt < new Date(Date.now() - 300000)) {
        await this.prisma.userSession.update({
          where:{id:session.id},data:{lastSeenAt:new Date()}
        });
      }
    }

    return { id:user.id,email:user.email,role:user.role,sessionId:payload.sid };
  }
}
