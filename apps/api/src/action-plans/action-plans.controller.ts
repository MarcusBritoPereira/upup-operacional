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
  Request,
} from '@nestjs/common';
import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('action-plans')
@UseGuards(JwtAuthGuard)
export class ActionPlansController {
  constructor(private readonly actionPlansService: ActionPlansService) {}

  @Post()
  create(@Request() req: any, @Body() createActionPlanDto: CreateActionPlanDto) {
    const creatorId = req.user.id;
    return this.actionPlansService.create(creatorId, createActionPlanDto);
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('responsibleId') responsibleId?: string,
    @Query('status') status?: string,
  ) {
    return this.actionPlansService.findAll(clientId, responsibleId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actionPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateActionPlanDto: UpdateActionPlanDto,
  ) {
    const updaterId = req.user.id;
    return this.actionPlansService.update(id, updaterId, updateActionPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actionPlansService.remove(id);
  }
}
