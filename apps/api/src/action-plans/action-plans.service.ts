import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';

@Injectable()
export class ActionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatorId: string, dto: CreateActionPlanDto) {
    const { clientId, monthlyCycleId, responsibleId, dueDate, ...rest } = dto;

    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
    }

    // Create the Action Plan
    const actionPlan = await this.prisma.actionPlan.create({
      data: {
        ...rest,
        clientId,
        monthlyCycleId: monthlyCycleId || null,
        responsibleId: responsibleId || null,
        createdById: creatorId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Create a timeline event
    await this.prisma.clientTimeline.create({
      data: {
        clientId,
        eventType: 'action_plan_created',
        title: 'Plano de Ação Criado',
        description: `Problema: ${dto.problem}\nAção: ${dto.action}`,
        createdById: creatorId,
      },
    });

    return actionPlan;
  }

  async findAll(clientId?: string, responsibleId?: string, status?: string) {
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (responsibleId) where.responsibleId = responsibleId;
    if (status) where.status = status;

    return this.prisma.actionPlan.findMany({
      where,
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
      throw new NotFoundException(`Plano de ação com ID "${id}" não encontrado.`);
    }

    return actionPlan;
  }

  async update(id: string, updaterId: string, dto: UpdateActionPlanDto) {
    const actionPlan = await this.findOne(id);

    const { dueDate, ...rest } = dto;

    const updated = await this.prisma.actionPlan.update({
      where: { id },
      data: {
        ...rest,
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

      await this.prisma.clientTimeline.create({
        data: {
          clientId: actionPlan.clientId,
          eventType: 'action_plan_status_changed',
          title,
          description: description || `Status alterado de ${actionPlan.status} para ${dto.status}`,
          createdById: updaterId,
        },
      });
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.actionPlan.delete({
      where: { id },
    });
  }
}
