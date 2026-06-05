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

  @Get()
  findAll(
    @Query('status') status: string | undefined,
    @Query('managerId') managerId: string | undefined,
    @Query('squadId') squadId: string | undefined,
    @Req() req: any,
  ) {
    return this.clientsService.findAll({ status, managerId, squadId }, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, id);
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Req() req: any,
  ) {
    await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, id);
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles('admin', 'diretoria')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, id);
    return this.clientsService.remove(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string, @Req() req: any) {
    await this.clientAccessPolicy.assertCanAccess(req.user.id, req.user.role, id);
    return this.clientsService.getTimeline(id);
  }
}
