import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  position: true,
  isActive: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: { id: string; role: string }) {
    const where = await this.getUserScope(currentUser);

    return this.prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, currentUser: { id: string; role: string }) {
    const where = await this.getUserScope(currentUser);
    const user = await this.prisma.user.findFirst({
      where: { AND: [{ id }, where] },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    return user;
  }

  private async getUserScope(currentUser: { id: string; role: string }) {
    if (['admin', 'diretoria', 'gerencia'].includes(currentUser.role)) {
      return {};
    }

    if (currentUser.role !== 'gestor_cliente') {
      throw new ForbiddenException(
        'Você não tem permissão para listar usuários.',
      );
    }

    const managedClients = await this.prisma.client.findMany({
      where: { managerId: currentUser.id },
      select: { id: true },
    });
    const clientIds = managedClients.map((client) => client.id);

    if (clientIds.length === 0) {
      return { id: currentUser.id };
    }

    return {
      OR: [
        { id: currentUser.id },
        { clientTeamRoles: { some: { clientId: { in: clientIds } } } },
      ],
    } satisfies Prisma.UserWhereInput;
  }
}
