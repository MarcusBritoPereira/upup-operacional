import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceProvidersService {
  constructor(private readonly prisma: PrismaService) {}

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
    });
    if (!provider) {
      throw new NotFoundException(
        `Prestador de serviço com ID ${id} não encontrado`,
      );
    }
    return provider;
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
