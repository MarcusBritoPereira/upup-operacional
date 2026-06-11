import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientAccessPolicy {
  constructor(private prisma: PrismaService) {}

  private async getClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { managerId: true },
    });
    if (!client) {
      throw new NotFoundException(`Cliente com ID "${clientId}" não encontrado.`);
    }
    return client;
  }

  // 1. Visualizar: gestor, membro do squad, gerência e superiores
  async canViewClient(userId: string, role: string, clientId: string): Promise<boolean> {
    if (['admin', 'diretoria', 'gerencia'].includes(role)) {
      return true;
    }

    const client = await this.getClient(clientId);

    if (client.managerId === userId) {
      return true;
    }

    const isTeamMember = await this.prisma.clientTeamMember.findFirst({
      where: {
        clientId: clientId,
        userId: userId,
      },
    });
    
    if (isTeamMember) {
      return true;
    }

    return false;
  }

  // 2. Operar (criar follow-up, editar entregáveis): gestor do cliente, membro do squad, gerência e superiores
  async canOperateClient(userId: string, role: string, clientId: string): Promise<boolean> {
    // Mesma lógica de visualização, mas separada semanticamente caso queira restringir no futuro
    return this.canViewClient(userId, role, clientId);
  }

  // 3. Alterar cadastro: gestor do cliente, gerência e superiores
  async canManageClient(userId: string, role: string, clientId: string): Promise<boolean> {
    if (['admin', 'diretoria', 'gerencia'].includes(role)) {
      return true;
    }

    const client = await this.getClient(clientId);

    return client.managerId === userId;
  }

  // 4. Mudar gestor/time: gerência e superiores
  async canAssignManagerOrTeam(role: string): Promise<boolean> {
    return ['admin', 'diretoria', 'gerencia'].includes(role);
  }

  // 5. Arquivar/churn: diretoria/administração
  async canArchiveClient(role: string): Promise<boolean> {
    return ['admin', 'diretoria'].includes(role);
  }

  async assertCanViewClient(userId: string, role: string, clientId: string): Promise<void> {
    const hasAccess = await this.canViewClient(userId, role, clientId);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem permissão para visualizar este cliente.');
    }
  }

  async assertCanOperateClient(userId: string, role: string, clientId: string): Promise<void> {
    const hasAccess = await this.canOperateClient(userId, role, clientId);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem permissão para realizar operações neste cliente.');
    }
  }

  async assertCanManageClient(userId: string, role: string, clientId: string): Promise<void> {
    const hasAccess = await this.canManageClient(userId, role, clientId);
    if (!hasAccess) {
      throw new ForbiddenException('Você não tem permissão para alterar as configurações deste cliente.');
    }
  }

  async assertCanArchiveClient(role: string): Promise<void> {
    const hasAccess = await this.canArchiveClient(role);
    if (!hasAccess) {
      throw new ForbiddenException('Apenas a diretoria e administradores podem arquivar clientes.');
    }
  }
}
