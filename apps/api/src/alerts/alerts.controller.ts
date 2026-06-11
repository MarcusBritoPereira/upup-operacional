import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  @Get()
  async findAll(
    @Query('clientId') clientId: string | undefined,
    @Query('status') status: string | undefined,
    @Req() req: RequestWithAuth,
  ) {
    if (clientId) {
      await this.clientAccessPolicy.assertCanViewClient(
        req.user.id,
        req.user.role,
        clientId,
      );
    }
    return this.alertsService.findAll(clientId, status, req.user);
  }

  @Patch(':id/resolve')
  async resolve(@Param('id') id: string, @Req() req: RequestWithAuth) {
    const alert = await this.alertsService.findOne(id);
    await this.clientAccessPolicy.assertCanOperateClient(
      req.user.id,
      req.user.role,
      alert.clientId,
    );
    return this.alertsService.resolve(id, req.user.id);
  }
}
