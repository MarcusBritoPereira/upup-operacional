import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('followups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowupsController {
  constructor(
    private readonly followupsService: FollowupsService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  @Post()
  async create(
    @Req() req: RequestWithAuth,
    @Body() createFollowupDto: CreateFollowupDto,
  ) {
    await this.clientAccessPolicy.assertCanOperateClient(
      req.user.id,
      req.user.role,
      createFollowupDto.clientId,
    );
    const managerId = req.user.id;
    return this.followupsService.create(managerId, createFollowupDto);
  }

  @Get()
  async findAll(
    @Query('clientId') clientId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestWithAuth,
  ) {
    if (clientId) {
      await this.clientAccessPolicy.assertCanViewClient(
        req.user.id,
        req.user.role,
        clientId,
      );
    }
    return this.followupsService.findAll(clientId, req.user, { page, limit });
  }
}
