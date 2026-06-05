import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Post()
  create(@Request() req: any, @Body() createFollowupDto: CreateFollowupDto) {
    // Inject the logged-in user id as the manager id
    const managerId = req.user.id;
    return this.followupsService.create(managerId, createFollowupDto);
  }

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    return this.followupsService.findAll(clientId);
  }
}
