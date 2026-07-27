import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Request() req: RequestWithAuth) {
    const { id: userId, role } = req.user;
    return this.dashboardService.getOverview(userId, role);
  }

  @Get('today')
  getToday(@Request() req: RequestWithAuth) {
    const { id: userId, role } = req.user;
    return this.dashboardService.getToday(userId, role);
  }
}
