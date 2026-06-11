import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCredentialDto: CreateCredentialDto) {
    return this.prisma.credential.create({
      data: createCredentialDto,
    });
  }

  async findAll(clientId: string) {
    return this.prisma.credential.findMany({
      where: { clientId },
      orderBy: { systemName: 'asc' },
    });
  }

  async findOne(id: string) {
    const cred = await this.prisma.credential.findUnique({
      where: { id },
    });
    if (!cred) {
      throw new NotFoundException(`Credencial com ID ${id} não encontrada`);
    }
    return cred;
  }

  async update(id: string, updateCredentialDto: UpdateCredentialDto) {
    await this.findOne(id);
    return this.prisma.credential.update({
      where: { id },
      data: updateCredentialDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.credential.delete({
      where: { id },
    });
  }
}
