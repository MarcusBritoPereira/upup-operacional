import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SquadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.squad.findMany({
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!squad) {
      throw new NotFoundException(`Squad com ID "${id}" não encontrado.`);
    }

    return squad;
  }
}
