import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientAccessPolicy {
  constructor(private prisma: PrismaService) {}

  async canAccess(userId: string, role: string, clientId: string): Promise<boolean> {
    if (['admin', 'diretoria', 'gerencia'].includes(role)) {
      return true;
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { managerId: true, squadId: true },
    });

    if (!client) {
      return false;
    }

    if (client.managerId === userId) {
      return true;
    }

    if (client.squadId) {
      const isSquadMember = await this.prisma.squadMember.findFirst({
        where: {
          squadId: client.squadId,
          userId: userId,
        },
      });
      if (isSquadMember) {
        return true;
      }
    }

    return false;
  }

  async assertCanAccess(userId: string, role: string, clientId: string): Promise<void> {
    const hasAccess = await this.canAccess(userId, role, clientId);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem permissão para acessar este cliente.');
    }
  }
}
