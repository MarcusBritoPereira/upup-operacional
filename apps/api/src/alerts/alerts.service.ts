import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertSeverity } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string | undefined, status: string | undefined, user: { id: string; role: string }) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    if (!['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.clientTeamMember.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      });
      const clientIds = memberships.map((m) => m.clientId);

      where.client = {
        OR: [
          { managerId: user.id },
          { id: { in: clientIds } },
        ],
      };
    }

    return this.prisma.alert.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
            managerId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta com ID "${id}" não encontrado.`);
    }

    return alert;
  }

  async resolve(id: string, resolvedById: string) {
    await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedById,
      },
    });
  }

  async createAlert(clientId: string, type: string, severity: AlertSeverity, title: string, description?: string) {
    return this.prisma.alert.create({
      data: {
        clientId,
        alertType: type,
        severity,
        title,
        description,
        status: 'open',
      },
    });
  }
}
