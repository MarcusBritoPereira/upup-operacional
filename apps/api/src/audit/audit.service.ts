import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private paging(query: Record<string,string>) {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 50, 1), 200);
    return { page, pageSize, skip: (page - 1) * pageSize };
  }

  async summary() {
    const now = new Date();
    const day = new Date(now.getTime() - 86400000);
    const online = new Date(now.getTime() - 300000);

    const [onlineUsers, successfulLogins24h, failedLogins24h, activities24h] = await Promise.all([
      this.prisma.userSession.count({ where: {
        revokedAt: null, loggedOutAt: null, expiresAt: { gt: now }, lastSeenAt: { gte: online }
      }}),
      this.prisma.loginAuditLog.count({ where: { success: true, createdAt: { gte: day } } }),
      this.prisma.loginAuditLog.count({ where: { success: false, createdAt: { gte: day } } }),
      this.prisma.activityAuditLog.count({ where: { createdAt: { gte: day } } }),
    ]);

    return { onlineUsers, successfulLogins24h, failedLogins24h, activities24h };
  }

  async logins(query: Record<string,string>) {
    const { page, pageSize, skip } = this.paging(query);
    const where: Prisma.LoginAuditLogWhereInput = {
      ...(query.email ? { email: { contains: query.email, mode: 'insensitive' } } : {}),
      ...(query.ip ? { ipAddress: { contains: query.ip } } : {}),
      ...(query.success === 'true' ? { success: true } : query.success === 'false' ? { success: false } : {}),
    };
    const [items,total] = await Promise.all([
      this.prisma.loginAuditLog.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id:true,name:true,email:true,role:true } } }
      }),
      this.prisma.loginAuditLog.count({ where })
    ]);
    return { items,total,page,pageSize };
  }

  async activities(query: Record<string,string>) {
    const { page, pageSize, skip } = this.paging(query);
    const where: Prisma.ActivityAuditLogWhereInput = {
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' } } : {}),
      ...(query.ip ? { ipAddress: { contains: query.ip } } : {}),
    };
    const [items,total] = await Promise.all([
      this.prisma.activityAuditLog.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id:true,name:true,email:true,role:true } } }
      }),
      this.prisma.activityAuditLog.count({ where })
    ]);
    return { items,total,page,pageSize };
  }

  async sessions(query: Record<string,string>) {
    const { page, pageSize, skip } = this.paging(query);
    const now = new Date();
    const items = await this.prisma.userSession.findMany({
      skip, take: pageSize, orderBy: { lastSeenAt: 'desc' },
      include: { user: { select: { id:true,name:true,email:true,role:true } } }
    });
    const total = await this.prisma.userSession.count();
    return {
      items: items.map(s => ({
        ...s,
        isOnline: !s.revokedAt && !s.loggedOutAt && s.expiresAt > now
          && s.lastSeenAt > new Date(now.getTime() - 300000)
      })),
      total,page,pageSize
    };
  }

  async revoke(id: string, adminId: string, reason?: string) {
    const session = await this.prisma.userSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    await this.prisma.$transaction([
      this.prisma.userSession.update({
        where: { id },
        data: { revokedAt: new Date(), revokeReason: reason || 'Revogada pelo administrador' }
      }),
      this.prisma.activityAuditLog.create({
        data: {
          userId: adminId, action: 'SESSION_REVOKED',
          entityType: 'user_session', entityId: id,
          description: reason || 'Revogada pelo administrador'
        }
      })
    ]);
    return { success: true };
  }
}
