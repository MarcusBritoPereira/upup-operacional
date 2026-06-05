import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId?: string, status?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    return this.prisma.alert.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
            managerId: true,
            squadId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resolve(id: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta com ID "${id}" não encontrado.`);
    }

    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
      },
    });
  }

  async createAlert(clientId: string, type: string, severity: string, title: string, description?: string) {
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
