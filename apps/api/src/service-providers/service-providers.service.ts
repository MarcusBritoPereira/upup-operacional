import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClickUpService, NormalizedTask } from '../clickup/clickup.service';

@Injectable()
export class ServiceProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clickUpService: ClickUpService,
  ) {}

  async create(createServiceProviderDto: CreateServiceProviderDto) {
    return this.prisma.serviceProvider.create({
      data: createServiceProviderDto,
    });
  }

  async findAll() {
    return this.prisma.serviceProvider.findMany({
      orderBy: { name: 'asc' },
      include: {
        clientLinks: {
          include: {
            client: {
              select: {
                id: true,
                tradeName: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        clientLinks: {
          include: {
            client: {
              select: {
                id: true,
                tradeName: true,
                status: true,
              },
            },
          },
        },
      },
    });
    if (!provider) {
      throw new NotFoundException(
        `Prestador de serviço com ID ${id} não encontrado`,
      );
    }
    return provider;
  }

  async getProviderProfile(id: string) {
    const provider = await this.findOne(id);

    let clickupProfile = null;
    let clickupTasks: NormalizedTask[] = [];
    let stats = {
      open: 0,
      completed: 0,
      overdue: 0,
    };

    if (provider.email && this.clickUpService.isConfigured()) {
      try {
        const members = await this.clickUpService.listMembers();
        const providerEmail = provider.email.toLowerCase();
        const member = members.find(
          (m) => m.email.toLowerCase() === providerEmail,
        );

        if (member) {
          clickupProfile = member;
          const { tasks } = await this.clickUpService.listAllTasks({
            assignees: [member.clickupUserId.toString()],
            includeClosed: true,
          });

          clickupTasks = tasks;

          const now = new Date();

          tasks.forEach((task) => {
            const isDone = task.statusType === 'done' || task.statusType === 'closed';
            if (isDone) {
              stats.completed++;
            } else {
              stats.open++;
              if (task.dueDate && new Date(parseInt(task.dueDate, 10)) < now) {
                stats.overdue++;
              }
            }
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar dados do ClickUp para o prestador ${provider.name}:`, error.message);
      }
    }

    return {
      provider,
      clickupProfile,
      tasks: clickupTasks,
      stats,
    };
  }

  async update(id: string, updateServiceProviderDto: UpdateServiceProviderDto) {
    await this.findOne(id);
    return this.prisma.serviceProvider.update({
      where: { id },
      data: updateServiceProviderDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.serviceProvider.delete({
      where: { id },
    });
  }
}
