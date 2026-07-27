import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('summary') summary() { return this.service.summary(); }
  @Get('logins') logins(@Query() q: Record<string,string>) { return this.service.logins(q); }
  @Get('activities') activities(@Query() q: Record<string,string>) { return this.service.activities(q); }
  @Get('sessions') sessions(@Query() q: Record<string,string>) { return this.service.sessions(q); }

  @Patch('sessions/:id/revoke')
  revoke(@Param('id') id: string, @Req() req: RequestWithAuth, @Body() body: { reason?: string }) {
    return this.service.revoke(id, req.user.id, body.reason);
  }
}
