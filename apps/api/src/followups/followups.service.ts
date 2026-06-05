import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowupDto } from './dto/create-followup.dto';

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

  private async updateMonthlyCycleHealth(cycleId: string) {
    const currentCycle = await this.prisma.monthlyCycle.findUnique({
      where: { id: cycleId },
    });
    if (!currentCycle) return;

    const followups = await this.prisma.weeklyFollowup.findMany({
      where: { monthlyCycleId: cycleId },
    });

    if (followups.length === 0) {
      await this.prisma.monthlyCycle.update({
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

    let status = 'gray';
    if (averageScore >= 75) {
      status = 'green';
    } else if (averageScore >= 50) {
      status = 'yellow';
    } else {
      status = 'red';
    }

    const oldStatus = currentCycle.healthStatus;

    // Update cycle health parameters
    await this.prisma.monthlyCycle.update({
      where: { id: cycleId },
      data: {
        healthScore: averageScore,
        healthStatus: status,
      },
    });

    // Create automatic alert and timeline event if status changed to yellow or red
    if (status !== oldStatus && (status === 'yellow' || status === 'red')) {
      await this.prisma.alert.create({
        data: {
          clientId: currentCycle.clientId,
          alertType: 'health_drop',
          severity: status === 'yellow' ? 'medium' : 'high',
          title: `Saúde do Cliente mudou para ${status === 'yellow' ? 'Atenção' : 'Crítica'}!`,
          description: `A saúde do cliente no ciclo mensal caiu de ${oldStatus} para ${status} com o score de ${averageScore}.`,
          status: 'open',
        },
      });

      await this.prisma.clientTimeline.create({
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

    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
    }

    // Check if cycle exists
    const cycle = await this.prisma.monthlyCycle.findUnique({
      where: { id: monthlyCycleId },
    });
    if (!cycle) {
      throw new NotFoundException(`Ciclo mensal com ID "${monthlyCycleId}" não encontrado.`);
    }

    const score = this.calculateScore(createFollowupDto);

    const followup = await this.prisma.weeklyFollowup.create({
      data: {
        ...rest,
        clientId,
        monthlyCycleId,
        managerId,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        weeklyScore: score,
      },
    });

    await this.updateMonthlyCycleHealth(monthlyCycleId);

    return followup;
  }

  async findAll(clientId?: string) {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
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
