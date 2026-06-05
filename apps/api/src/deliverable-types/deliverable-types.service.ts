import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliverableTypeDto } from './dto/create-deliverable-type.dto';

@Injectable()
export class DeliverableTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeliverableTypeDto: CreateDeliverableTypeDto) {
    return this.prisma.deliverableType.create({
      data: createDeliverableTypeDto,
    });
  }

  async findAll(onlyActive: boolean = true) {
    return this.prisma.deliverableType.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const type = await this.prisma.deliverableType.findUnique({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException(`Tipo de entregável com ID "${id}" não encontrado.`);
    }

    return type;
  }

  async update(id: string, data: Partial<CreateDeliverableTypeDto>) {
    await this.findOne(id);

    return this.prisma.deliverableType.update({
      where: { id },
      data,
    });
  }
}
