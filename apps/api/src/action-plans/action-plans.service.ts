import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { ActionPlanPriority, ActionPlanStatus, Prisma } from '@prisma/client';
import {
  PaginationQuery,
  normalizePagination,
} from '../common/utils/pagination';

@Injectable()
export class ActionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertEligibleResponsible(
    tx: Prisma.TransactionClient,
    clientId: string,
    responsibleId: string,
  ) {
    const user = await tx.user.findUnique({
      where: { id: responsibleId },
      select: { id: true, isActive: true, role: true },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException('Responsável não encontrado ou inativo.');
    }

    if (['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      return;
    }

    const client = await tx.client.findUnique({
      where: { id: clientId },
      select: { managerId: true },
    });

    if (client?.managerId === responsibleId) {
      return;
    }

    const membership = await tx.clientTeamMember.findFirst({
      where: { clientId, userId: responsibleId },
      select: { id: true },
    });

    if (!membership) {
      throw new BadRequestException(
        'Responsável deve pertencer à equipe do cliente.',
      );
    }
  }

  async create(creatorId: string, dto: CreateActionPlanDto) {
    const { clientId, monthlyCycleId, responsibleId, dueDate, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Verify client exists
      const client = await tx.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Cliente com ID "${clientId}" não encontrado.`,
        );
      }

      // Verify cycle-client link
      if (monthlyCycleId) {
        const cycle = await tx.monthlyCycle.findUnique({
          where: { id: monthlyCycleId },
          select: { clientId: true },
        });
        if (!cycle) {
          throw new NotFoundException('Ciclo mensal não encontrado.');
        }
        if (cycle.clientId !== clientId) {
          throw new BadRequestException(
            'O ciclo mensal não pertence ao cliente informado.',
          );
        }
      }

      if (responsibleId) {
        await this.assertEligibleResponsible(tx, clientId, responsibleId);
      }

      // Create the Action Plan
      const actionPlan = await tx.actionPlan.create({
        data: {
          problem: rest.problem,
          probableCause: rest.probableCause,
          action: rest.action,
          priority: rest.priority || ActionPlanPriority.medium,
          status: rest.status || ActionPlanStatus.open,
          result: rest.result,
          learning: rest.learning,
          canBecomePlaybook: rest.canBecomePlaybook || false,
          clientId,
          monthlyCycleId: monthlyCycleId || null,
          responsibleId: responsibleId || null,
          createdById: creatorId,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      // Create a timeline event
      await tx.clientTimeline.create({
        data: {
          clientId,
          eventType: 'action_plan_created',
          title: 'Plano de Ação Criado',
          description: `Problema: ${dto.problem}\nAção: ${dto.action}`,
          createdById: creatorId,
        },
      });

      return actionPlan;
    });
  }

  async findAll(
    clientId?: string,
    responsibleId?: string,
    status?: string,
    user?: { id: string; role: string },
    pagination?: PaginationQuery,
  ) {
    const { skip, take } = normalizePagination(pagination);
    const where: Prisma.ActionPlanWhereInput = {};
    if (clientId) where.clientId = clientId;
    if (responsibleId) where.responsibleId = responsibleId;
    if (status) where.status = status as ActionPlanStatus;

    if (user && !['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.clientTeamMember.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      });
      const clientIds = memberships.map((m) => m.clientId);

      where.client = {
        OR: [{ managerId: user.id }, { id: { in: clientIds } }],
      };
    }

    return this.prisma.actionPlan.findMany({
      where,
      skip,
      take,
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const actionPlan = await this.prisma.actionPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            tradeName: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!actionPlan) {
      throw new NotFoundException(
        `Plano de ação com ID "${id}" não encontrado.`,
      );
    }

    return actionPlan;
  }

  async update(id: string, updaterId: string, dto: UpdateActionPlanDto) {
    const { dueDate, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      const actionPlan = await tx.actionPlan.findUnique({ where: { id } });
      if (!actionPlan) {
        throw new NotFoundException(
          `Plano de ação com ID "${id}" não encontrado.`,
        );
      }

      if (rest.responsibleId) {
        await this.assertEligibleResponsible(
          tx,
          actionPlan.clientId,
          rest.responsibleId,
        );
      }

      // Verify cycle-client link
      if (rest.monthlyCycleId) {
        const cycle = await tx.monthlyCycle.findUnique({
          where: { id: rest.monthlyCycleId },
          select: { clientId: true },
        });
        if (!cycle) {
          throw new NotFoundException('Ciclo mensal não encontrado.');
        }
        if (cycle.clientId !== actionPlan.clientId) {
          throw new BadRequestException(
            'O ciclo mensal não pertence ao cliente informado.',
          );
        }
      }

      const updated = await tx.actionPlan.update({
        where: { id },
        data: {
          problem: rest.problem,
          probableCause: rest.probableCause,
          action: rest.action,
          priority: rest.priority,
          status: rest.status,
          result: rest.result,
          learning: rest.learning,
          canBecomePlaybook: rest.canBecomePlaybook,
          monthlyCycleId: rest.monthlyCycleId,
          responsibleId: rest.responsibleId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        },
      });

      // If status changed to completed or cancelled, log on timeline
      if (dto.status && dto.status !== actionPlan.status) {
        let title = `Plano de Ação ${dto.status}`;
        let description = '';

        if (dto.status === 'completed') {
          title = 'Plano de Ação Concluído';
          description = `Resultado: ${dto.result || ''}\nAprendizado: ${dto.learning || ''}`;
        } else if (dto.status === 'cancelled') {
          title = 'Plano de Ação Cancelado';
          description = `Motivo: ${dto.result || 'Não informado'}`;
        }

        await tx.clientTimeline.create({
          data: {
            clientId: actionPlan.clientId,
            eventType: 'action_plan_status_changed',
            title,
            description:
              description ||
              `Status alterado de ${actionPlan.status} para ${dto.status}`,
            createdById: updaterId,
          },
        });
      }

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.actionPlan.delete({
      where: { id },
    });
  }
}
