import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateClientValue(clientId: string) {
    const activeContracts = await this.prisma.contract.findMany({
      where: {
        clientId,
        status: 'active',
      },
    });

    const totalValue = activeContracts.reduce(
      (sum, contract) => sum + Number(contract.monthlyValue),
      0,
    );

    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        monthlyContractValue: totalValue,
      },
    });
  }

  async create(createContractDto: CreateContractDto) {
    const { startDate, endDate, ...rest } = createContractDto;

    const contract = await this.prisma.contract.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await this.updateClientValue(contract.clientId);

    return contract;
  }

  async findAll(clientId?: string) {
    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
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
    const existing = await this.findOne(id);
    const { startDate, endDate, ...rest } = updateContractDto;

    const data: any = { ...rest };
    if (startDate) {
      data.startDate = new Date(startDate);
    }
    if (endDate !== undefined) {
      data.endDate = endDate ? new Date(endDate) : null;
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data,
    });

    await this.updateClientValue(existing.clientId);
    if (updated.clientId !== existing.clientId) {
      await this.updateClientValue(updated.clientId);
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.prisma.contract.delete({
      where: { id },
    });

    await this.updateClientValue(existing.clientId);
    return { success: true };
  }
}
