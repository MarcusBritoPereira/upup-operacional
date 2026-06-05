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
        squad: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    filters: { status?: string; managerId?: string; squadId?: string },
    user: { id: string; role: string },
  ) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.managerId) {
      where.managerId = filters.managerId;
    }
    if (filters.squadId) {
      where.squadId = filters.squadId;
    }

    // Aplicar escopo para usuários que não são admin/diretoria/gerência
    if (!['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.squadMember.findMany({
        where: { userId: user.id },
        select: { squadId: true },
      });
      const squadIds = memberships.map((m) => m.squadId);

      where.OR = [
        { managerId: user.id },
        { squadId: { in: squadIds } },
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
        squad: {
          select: {
            id: true,
            name: true,
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
        squad: {
          select: {
            id: true,
            name: true,
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
        squad: {
          select: {
            id: true,
            name: true,
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
}
