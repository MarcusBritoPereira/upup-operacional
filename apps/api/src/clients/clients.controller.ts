import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  @Post()
  @Roles('admin', 'diretoria', 'gerencia')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Post('bulk')
  @Roles('admin', 'diretoria', 'gerencia')
  async createBulk(@Body() createClientDtos: CreateClientDto[]) {
    if (!Array.isArray(createClientDtos) || createClientDtos.length === 0) {
      throw new BadRequestException('A requisição deve conter um array válido de clientes.');
    }
    return this.clientsService.createBulk(createClientDtos);
  }

  @Get()
  findAll(
    @Query('status') status: string | undefined,
    @Query('managerId') managerId: string | undefined,
    @Req() req: any,
  ) {
    return this.clientsService.findAll({ status, managerId }, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanViewClient(req.user.id, req.user.role, id);
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Req() req: any,
  ) {
    await this.clientAccessPolicy.assertCanManageClient(req.user.id, req.user.role, id);

    if (updateClientDto.managerId) {
      const canAssign = await this.clientAccessPolicy.canAssignManagerOrTeam(req.user.role);
      if (!canAssign) {
        throw new ForbiddenException('Apenas a gerência ou cargos superiores podem alterar o gestor do cliente.');
      }
    }

    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanArchiveClient(req.user.role);
    return this.clientsService.remove(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanViewClient(req.user.id, req.user.role, id);
    return this.clientsService.getTimeline(id);
  }

  @Post(':id/team')
  async addTeamMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
    @Req() req: any,
  ) {
    const canAssign = await this.clientAccessPolicy.canAssignManagerOrTeam(req.user.role);
    if (!canAssign) {
      throw new ForbiddenException('Apenas a gerência ou cargos superiores podem alterar a equipe do cliente.');
    }
    return this.clientsService.addTeamMember(id, body.userId, body.role);
  }

  @Delete(':id/team/:userId/:role')
  async removeTeamMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('role') role: string,
    @Req() req: any,
  ) {
    const canAssign = await this.clientAccessPolicy.canAssignManagerOrTeam(req.user.role);
    if (!canAssign) {
      throw new ForbiddenException('Apenas a gerência ou cargos superiores podem alterar a equipe do cliente.');
    }
    return this.clientsService.removeTeamMember(id, userId, role);
  }
}
