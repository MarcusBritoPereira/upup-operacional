import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { Prisma, AlertSeverity, HealthStatus } from '@prisma/client';

@Injectable()
export class FollowupsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateScore(dto: CreateFollowupDto): number {
    let score = 0;

    if (dto.groupActivated === 'yes') score += 15;
    if (dto.clientResponded === 'yes') score += 15;
    if (dto.agencyRespondedOnTime === 'yes') score += 25;
    if (dto.calendarOnTrack === 'yes') score += 25;
    if (dto.hasDelayedDelivery === false) score += 10;
    if (dto.clientShowedDissatisfaction === false) score += 10;

    return score;
  }

  private async updateMonthlyCycleHealth(cycleId: string, tx: Prisma.TransactionClient) {
    const currentCycle = await tx.monthlyCycle.findUnique({
      where: { id: cycleId },
    });
    if (!currentCycle) return;

    const followups = await tx.weeklyFollowup.findMany({
      where: { monthlyCycleId: cycleId },
    });

    if (followups.length === 0) {
      await tx.monthlyCycle.update({
        where: { id: cycleId },
        data: {
          healthScore: null,
          healthStatus: 'gray',
        },
      });
      return;
    }

    const totalScore = followups.reduce((sum, f) => sum + f.weeklyScore, 0);
    const averageScore = Math.round(totalScore / followups.length);

    let status: HealthStatus = 'gray';
    if (averageScore >= 75) {
      status = 'green';
    } else if (averageScore >= 50) {
      status = 'yellow';
    } else {
      status = 'red';
    }

    const oldStatus = currentCycle.healthStatus;

    // Update cycle health parameters
    await tx.monthlyCycle.update({
      where: { id: cycleId },
      data: {
        healthScore: averageScore,
        healthStatus: status,
      },
    });

    // Create automatic alert and timeline event if status changed to yellow or red
    if (status !== oldStatus && (status === 'yellow' || status === 'red')) {
      await tx.alert.create({
        data: {
          clientId: currentCycle.clientId,
          alertType: 'health_drop',
          severity: status === 'yellow' ? AlertSeverity.medium : AlertSeverity.high,
          title: `Saúde do Cliente mudou para ${status === 'yellow' ? 'Atenção' : 'Crítica'}!`,
          description: `A saúde do cliente no ciclo mensal caiu de ${oldStatus} para ${status} com o score de ${averageScore}.`,
          status: 'open',
        },
      });

      await tx.clientTimeline.create({
        data: {
          clientId: currentCycle.clientId,
          eventType: 'health_status_changed',
          title: `Saúde Alterada para ${status.toUpperCase()}`,
          description: `O termômetro de saúde do ciclo mensal atualizou de ${oldStatus} para ${status} (Score médio: ${averageScore}).`,
        },
      });
    }
  }

  async create(managerId: string, createFollowupDto: CreateFollowupDto) {
    const { clientId, monthlyCycleId, weekStart, weekEnd, ...rest } = createFollowupDto;

    return this.prisma.$transaction(async (tx) => {
      // Check if client exists
      const client = await tx.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
      }

      // Check if cycle exists
      const cycle = await tx.monthlyCycle.findUnique({
        where: { id: monthlyCycleId },
      });
      if (!cycle) {
        throw new NotFoundException(`Ciclo mensal com ID "${monthlyCycleId}" não encontrado.`);
      }

      // Validate cycle-client relationship
      if (cycle.clientId !== clientId) {
        throw new BadRequestException('O ciclo mensal não pertence ao cliente informado.');
      }

      // Check date ordering rules
      const start = new Date(weekStart);
      const end = new Date(weekEnd);
      if (end < start) {
        throw new BadRequestException('A data de fim da semana deve ser maior ou igual à data de início.');
      }

      const score = this.calculateScore(createFollowupDto);

      const followup = await tx.weeklyFollowup.create({
        data: {
          ...rest,
          clientId,
          monthlyCycleId,
          managerId,
          weekStart: start,
          weekEnd: end,
          weeklyScore: score,
        },
      });

      await this.updateMonthlyCycleHealth(monthlyCycleId, tx);

      return followup;
    });
  }

  async findAll(clientId: string | undefined, user: { id: string; role: string }) {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    if (!['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.squadMember.findMany({
        where: { userId: user.id },
        select: { squadId: true },
      });
      const squadIds = memberships.map((m) => m.squadId);

      where.client = {
        OR: [
          { managerId: user.id },
          { squadId: { in: squadIds } },
        ],
      };
    }

    return this.prisma.weeklyFollowup.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        weekStart: 'desc',
      },
    });
  }
}
