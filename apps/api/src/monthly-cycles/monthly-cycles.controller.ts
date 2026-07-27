import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MonthlyCyclesService } from './monthly-cycles.service';
import { InitializeCycleDto } from './dto/initialize-cycle.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('monthly-cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlyCyclesController {
  constructor(
    private readonly monthlyCyclesService: MonthlyCyclesService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  @Get()
  async findAll(
    @Query('clientId') clientId: string,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestWithAuth,
  ) {
    await this.clientAccessPolicy.assertCanViewClient(
      req.user.id,
      req.user.role,
      clientId,
    );
    return this.monthlyCyclesService.findAll(clientId, { page, limit });
  }

  @Post('initialize')
  @Roles('super_admin', 'admin', 'diretoria', 'gerencia', 'gestor_cliente')
  async initialize(
    @Body() initializeCycleDto: InitializeCycleDto,
    @Req() req: RequestWithAuth,
  ) {
    await this.clientAccessPolicy.assertCanOperateClient(
      req.user.id,
      req.user.role,
      initializeCycleDto.clientId,
    );
    return this.monthlyCyclesService.initialize(initializeCycleDto);
  }

  @Patch('deliverables/:id')
  async updateDeliverable(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto,
    @Req() req: RequestWithAuth,
  ) {
    const clientId =
      await this.monthlyCyclesService.getClientIdForDeliverable(id);
    await this.clientAccessPolicy.assertCanOperateClient(
      req.user.id,
      req.user.role,
      clientId,
    );
    return this.monthlyCyclesService.updateDeliverable(
      id,
      updateDeliverableDto,
    );
  }
}
