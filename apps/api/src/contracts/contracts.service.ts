import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateClientValue(
    clientId: string,
    tx: Prisma.TransactionClient,
  ) {
    const activeContracts = await tx.contract.findMany({
      where: {
        clientId,
        status: 'active',
      },
    });

    const totalValue = activeContracts.reduce(
      (sum, contract) => sum.plus(new Prisma.Decimal(contract.monthlyValue)),
      new Prisma.Decimal(0),
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

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        throw new BadRequestException(
          'A data de término (endDate) deve ser maior ou igual à data de início (startDate).',
        );
      }
    }

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
    const where: Prisma.ContractWhereInput = {};
    if (clientId) {
      where.clientId = clientId;
    }

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

      const finalStartDate = startDate
        ? new Date(startDate)
        : existing.startDate;
      const finalEndDate =
        endDate !== undefined
          ? endDate
            ? new Date(endDate)
            : null
          : existing.endDate;

      if (finalStartDate && finalEndDate) {
        if (finalEndDate < finalStartDate) {
          throw new BadRequestException(
            'A data de término (endDate) deve ser maior ou igual à data de início (startDate).',
          );
        }
      }

      const data: Prisma.ContractUpdateInput = { ...rest };
      if (startDate) {
        data.startDate = finalStartDate;
      }
      if (endDate !== undefined) {
        data.endDate = finalEndDate;
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
