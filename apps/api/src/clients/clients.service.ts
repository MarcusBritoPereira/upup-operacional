import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const { entryDate, exitDate, ...rest } = createClientDto;

    if (entryDate && exitDate) {
      const entry = new Date(entryDate);
      const exit = new Date(exitDate);
      if (exit < entry) {
        throw new BadRequestException('A data de saída (exitDate) deve ser maior ou igual à data de entrada (entryDate).');
      }
    }

    return this.prisma.client.create({
      data: {
        ...rest,
        entryDate: new Date(entryDate),
        exitDate: exitDate ? new Date(exitDate) : null,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        teamMembers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async createBulk(createClientDtos: CreateClientDto[]) {
    // Validação prévia de todos os registros para fail-fast
    for (const dto of createClientDtos) {
      if (dto.entryDate && dto.exitDate) {
        if (new Date(dto.exitDate) < new Date(dto.entryDate)) {
          throw new BadRequestException(`A data de saída (exitDate) deve ser maior ou igual à data de entrada para o cliente: ${dto.tradeName}.`);
        }
      }
    }

    const data = createClientDtos.map(dto => {
      const { entryDate, exitDate, ...rest } = dto;
      return {
        ...rest,
        entryDate: new Date(entryDate),
        exitDate: exitDate ? new Date(exitDate) : null,
      };
    });

    const result = await this.prisma.client.createMany({
      data,
    });

    return { count: result.count };
  }

  async findAll(
    filters: { status?: string; managerId?: string },
    user: { id: string; role: string },
  ) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.managerId) {
      where.managerId = filters.managerId;
    }

    // Aplicar escopo para usuários que não são admin/diretoria/gerência
    if (!['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.clientTeamMember.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      });
      const clientIds = memberships.map((m) => m.clientId);

      where.OR = [
        { managerId: user.id },
        { id: { in: clientIds } },
      ];
    }

    return this.prisma.client.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        teamMembers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        tradeName: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        teamMembers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID "${id}" não encontrado.`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    // Check if client exists
    const existing = await this.findOne(id);

    const { entryDate, exitDate, ...rest } = updateClientDto;

    const finalEntryDate = entryDate ? new Date(entryDate) : existing.entryDate;
    const finalExitDate = exitDate !== undefined ? (exitDate ? new Date(exitDate) : null) : existing.exitDate;

    if (finalEntryDate && finalExitDate) {
      if (finalExitDate < finalEntryDate) {
        throw new BadRequestException('A data de saída (exitDate) deve ser maior ou igual à data de entrada (entryDate).');
      }
    }

    const data: any = { ...rest };
    if (entryDate) {
      data.entryDate = finalEntryDate;
    }
    if (exitDate !== undefined) {
      data.exitDate = finalExitDate;
    }

    return this.prisma.client.update({
      where: { id },
      data,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        teamMembers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if client exists
    await this.findOne(id);

    return this.prisma.client.update({
      where: { id },
      data: {
        status: 'churned',
      },
    });
  }

  async getTimeline(clientId: string) {
    await this.findOne(clientId);
    return this.prisma.clientTimeline.findMany({
      where: { clientId },
      include: {
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

  async addTeamMember(clientId: string, userId: string, role: string) {
    // Check if client exists
    await this.findOne(clientId);

    // Check if member already exists
    const existing = await this.prisma.clientTeamMember.findFirst({
      where: { clientId, userId, role },
    });

    if (existing) {
      throw new BadRequestException('Usuário já possui este papel neste cliente.');
    }

    return this.prisma.clientTeamMember.create({
      data: {
        clientId,
        userId,
        role,
      },
    });
  }

  async removeTeamMember(clientId: string, userId: string, role: string) {
    // Check if client exists
    await this.findOne(clientId);

    const existing = await this.prisma.clientTeamMember.findFirst({
      where: { clientId, userId, role },
    });

    if (!existing) {
      throw new NotFoundException('Membro da equipe não encontrado.');
    }

    return this.prisma.clientTeamMember.delete({
      where: { id: existing.id },
    });
  }
}
