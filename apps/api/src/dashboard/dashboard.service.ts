import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async getClientFilter(userId: string, role: string) {
    if (role === 'admin' || role === 'diretoria' || role === 'gerencia') {
      return {};
    }
    if (role === 'gestor_cliente') {
      return { managerId: userId };
    }

    const memberships = await this.prisma.squadMember.findMany({
      where: { userId },
      select: { squadId: true },
    });
    const squadIds = memberships.map((m) => m.squadId);

    return { squadId: { in: squadIds } };
  }

  async getOverview(userId: string, role: string) {
    const clientFilter = await this.getClientFilter(userId, role);

    // Get active clients under this scope
    const activeClients = await this.prisma.client.findMany({
      where: {
        status: 'active',
        ...clientFilter,
      },
      include: {
        monthlyCycles: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const totalActiveClients = activeClients.length;

    let clientsHealthy = 0;
    let clientsAtRisk = 0;
    let clientsWithoutFollowup = 0;
    let totalPortfolioValue = 0;

    activeClients.forEach((client) => {
      totalPortfolioValue += Number(client.monthlyContractValue);

      const latestCycle = client.monthlyCycles[0];
      if (!latestCycle) {
        clientsWithoutFollowup++;
      } else if (latestCycle.healthStatus === 'green') {
        clientsHealthy++;
      } else if (latestCycle.healthStatus === 'red' || latestCycle.healthStatus === 'yellow') {
        clientsAtRisk++;
      } else {
        clientsWithoutFollowup++;
      }
    });

    // Get overdue action plans
    const now = new Date();
    const actionPlanFilter = role === 'admin' || role === 'diretoria' || role === 'gerencia'
      ? {}
      : role === 'gestor_cliente'
      ? { client: { managerId: userId } }
      : { client: { squadId: { in: await this.getSquadIds(userId) } } };

    const overdueActionPlans = await this.prisma.actionPlan.count({
      where: {
        status: { notIn: ['completed', 'cancelled'] },
        dueDate: { lt: now },
        ...actionPlanFilter,
      },
    });

    // Get clients with health warning details for listing
    const riskClientsList = activeClients
      .filter((client) => {
        const status = client.monthlyCycles[0]?.healthStatus;
        return status === 'red' || status === 'yellow';
      })
      .map((client) => ({
        id: client.id,
        tradeName: client.tradeName,
        healthStatus: client.monthlyCycles[0]?.healthStatus,
        healthScore: client.monthlyCycles[0]?.healthScore,
      }));

    return {
      totalActiveClients,
      clientsHealthy,
      clientsAtRisk,
      clientsWithoutFollowup,
      overdueActionPlans,
      totalPortfolioValue,
      riskClientsList,
    };
  }

  async getToday(userId: string, role: string) {
    const clientFilter = await this.getClientFilter(userId, role);

    // Alertas em aberto
    const alerts = await this.prisma.alert.findMany({
      where: {
        status: 'open',
        client: clientFilter,
      },
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Planos de ação pendentes (responsabilidade do usuário logado)
    const pendingActionPlans = await this.prisma.actionPlan.findMany({
      where: {
        status: { notIn: ['completed', 'cancelled'] },
        responsibleId: userId,
      },
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return {
      alerts,
      pendingActionPlans,
    };
  }

  private async getSquadIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.squadMember.findMany({
      where: { userId },
      select: { squadId: true },
    });
    return memberships.map((m) => m.squadId);
  }
}
