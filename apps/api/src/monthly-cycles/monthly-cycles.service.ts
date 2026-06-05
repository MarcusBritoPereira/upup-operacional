import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitializeCycleDto } from './dto/initialize-cycle.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

@Injectable()
export class MonthlyCyclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string) {
    return this.prisma.monthlyCycle.findMany({
      where: { clientId },
      include: {
        monthlyDeliverables: {
          include: {
            deliverableType: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });
  }

  async initialize(initializeCycleDto: InitializeCycleDto) {
    const { clientId, month, year } = initializeCycleDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if client exists
        const client = await tx.client.findUnique({
          where: { id: clientId },
        });
        if (!client) {
          throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
        }

        // Check if cycle already exists
        const cycle = await tx.monthlyCycle.findUnique({
          where: {
            clientId_month_year: {
              clientId,
              month,
              year,
            },
          },
          include: {
            monthlyDeliverables: {
              include: {
                deliverableType: true,
              },
            },
          },
        });

        if (cycle) {
          return cycle;
        }

        // Create new cycle
        const newCycle = await tx.monthlyCycle.create({
          data: {
            clientId,
            month,
            year,
            managerId: client.managerId,
            status: 'open',
            healthStatus: 'gray',
          },
        });

        // Instantiate active deliverables
        const deliverableTypes = await tx.deliverableType.findMany({
          where: { isActive: true },
        });

        if (deliverableTypes.length > 0) {
          await tx.monthlyDeliverable.createMany({
            data: deliverableTypes.map((type) => ({
              monthlyCycleId: newCycle.id,
              deliverableTypeId: type.id,
              contractedQuantity: 0,
              deliveredQuantity: 0,
              inProgressQuantity: 0,
              delayedQuantity: 0,
              status: 'pending',
            })),
          });
        }

        const completeCycle = await tx.monthlyCycle.findUnique({
          where: { id: newCycle.id },
          include: {
            monthlyDeliverables: {
              include: {
                deliverableType: true,
              },
            },
          },
        });

        return completeCycle!;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const cycle = await this.prisma.monthlyCycle.findUnique({
          where: {
            clientId_month_year: {
              clientId,
              month,
              year,
            },
          },
          include: {
            monthlyDeliverables: {
              include: {
                deliverableType: true,
              },
            },
          },
        });
        if (cycle) {
          return cycle;
        }
      }
      throw error;
    }
  }

  async updateDeliverable(id: string, updateDeliverableDto: UpdateDeliverableDto) {
    const deliverable = await this.prisma.monthlyDeliverable.findUnique({
      where: { id },
    });

    if (!deliverable) {
      throw new NotFoundException(`Entregável mensal com ID "${id}" não encontrado.`);
    }

    return this.prisma.monthlyDeliverable.update({
      where: { id },
      data: updateDeliverableDto as any,
      include: {
        deliverableType: true,
      },
    });
  }

  async getClientIdForDeliverable(deliverableId: string): Promise<string> {
    const deliverable = await this.prisma.monthlyDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        monthlyCycle: {
          select: { clientId: true },
        },
      },
    });
    if (!deliverable) {
      throw new NotFoundException(`Entregável com ID "${deliverableId}" não encontrado.`);
    }
    return deliverable.monthlyCycle.clientId;
  }
}
