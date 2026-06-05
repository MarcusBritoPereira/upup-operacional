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

    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
    }

    // Check if cycle already exists
    let cycle = await this.prisma.monthlyCycle.findUnique({
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
    const newCycle = await this.prisma.monthlyCycle.create({
      data: {
        clientId,
        month,
        year,
        managerId: client.managerId,
        status: 'open',
        healthStatus: 'gray',
      },
      include: {
        monthlyDeliverables: {
          include: {
            deliverableType: true,
          },
        },
      },
    });

    // Instantiate active deliverables
    const deliverableTypes = await this.prisma.deliverableType.findMany({
      where: { isActive: true },
    });

    if (deliverableTypes.length > 0) {
      await this.prisma.monthlyDeliverable.createMany({
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

      // Fetch again with newly created deliverables
      const updatedCycle = await this.prisma.monthlyCycle.findUnique({
        where: { id: newCycle.id },
        include: {
          monthlyDeliverables: {
            include: {
              deliverableType: true,
            },
          },
        },
      });
      return updatedCycle!;
    }

    return newCycle;
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
      data: updateDeliverableDto,
      include: {
        deliverableType: true,
      },
    });
  }
}
