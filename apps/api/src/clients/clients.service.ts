import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const { entryDate, exitDate, ...rest } = createClientDto;

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

  async findAll(filters: { status?: string; managerId?: string; squadId?: string }) {
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
    await this.findOne(id);

    const { entryDate, exitDate, ...rest } = updateClientDto;

    const data: any = { ...rest };
    if (entryDate) {
      data.entryDate = new Date(entryDate);
    }
    if (exitDate !== undefined) {
      data.exitDate = exitDate ? new Date(exitDate) : null;
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

    return this.prisma.client.delete({
      where: { id },
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
