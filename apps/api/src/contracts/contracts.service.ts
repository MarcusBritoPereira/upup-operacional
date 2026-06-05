import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateClientValue(clientId: string, tx: Prisma.TransactionClient) {
    const activeContracts = await tx.contract.findMany({
      where: {
        clientId,
        status: 'active',
      },
    });

    const totalValue = activeContracts.reduce(
      (sum, contract) => sum + Number(contract.monthlyValue),
      0,
    );

    await tx.client.update({
      where: { id: clientId },
      data: {
        monthlyContractValue: totalValue,
      },
    });
  }

  async create(createContractDto: CreateContractDto) {
    const { startDate, endDate, ...rest } = createContractDto;

    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          ...rest,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          status: rest.status || 'active',
        },
      });

      await this.updateClientValue(contract.clientId, tx);

      return contract;
    });
  }

  async findAll(clientId?: string, user?: { id: string; role: string }) {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }

    if (user && !['admin', 'diretoria', 'gerencia'].includes(user.role)) {
      const memberships = await this.prisma.squadMember.findMany({
        where: { userId: user.id },
        select: { squadId: true },
      });
      const squadIds = memberships.map((m) => m.squadId);

      where.client = {
        OR: [
          { managerId: user.id },
          { squadId: { in: squadIds } },
        ],
      };
    }

    return this.prisma.contract.findMany({
      where,
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    const { startDate, endDate, ...rest } = updateContractDto;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.contract.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
      }

      const data: any = { ...rest };
      if (startDate) {
        data.startDate = new Date(startDate);
      }
      if (endDate !== undefined) {
        data.endDate = endDate ? new Date(endDate) : null;
      }

      const updated = await tx.contract.update({
        where: { id },
        data,
      });

      await this.updateClientValue(existing.clientId, tx);
      if (updated.clientId !== existing.clientId) {
        await this.updateClientValue(updated.clientId, tx);
      }

      return updated;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.contract.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
      }

      await tx.contract.delete({
        where: { id },
      });

      await this.updateClientValue(existing.clientId, tx);
      return { success: true };
    });
  }
}
