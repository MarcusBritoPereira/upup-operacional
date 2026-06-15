import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClickUpService } from './clickup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';

@Controller('clickup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClickUpController {
  constructor(private readonly clickupService: ClickUpService) {}

  /** Diz se o token está configurado — útil pra esconder a aba no front. */
  @Get('status')
  @Roles('admin', 'diretoria', 'gerencia')
  status() {
    return { configured: this.clickupService.isConfigured() };
  }

  /** Lista os workspaces que o token enxerga. */
  @Get('workspaces')
  @Roles('admin', 'diretoria', 'gerencia')
  workspaces() {
    return this.clickupService.getWorkspaces();
  }

  /** Puxa todos os usuários (membros) do workspace. */
  @Get('members')
  @Roles('admin', 'diretoria', 'gerencia')
  members() {
    return this.clickupService.listMembers();
  }

  /** Puxa todas as tasks do workspace, com filtros opcionais. */
  @Get('tasks')
  @Roles('admin', 'diretoria', 'gerencia', 'gestor_cliente')
  tasks(@Query() query: ListTasksQueryDto) {
    return this.clickupService.listAllTasks(query);
  }
}
