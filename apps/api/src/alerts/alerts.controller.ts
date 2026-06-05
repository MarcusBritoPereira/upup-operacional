import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    return this.alertsService.findAll(clientId, status);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
