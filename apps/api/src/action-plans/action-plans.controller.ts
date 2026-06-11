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
import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';
import type { RequestWithAuth } from '../auth/interfaces/auth-user.interface';

@Controller('action-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionPlansController {
  constructor(
    private readonly actionPlansService: ActionPlansService,
    private readonly clientAccessPolicy: ClientAccessPolicy,
  ) {}

  @Post()
  async create(
    @Req() req: RequestWithAuth,
    @Body() createActionPlanDto: CreateActionPlanDto,
  ) {
    await this.clientAccessPolicy.assertCanOperateClient(
      req.user.id,
      req.user.role,
      createActionPlanDto.clientId,
    );
    const creatorId = req.user.id;
    return this.actionPlansService.create(creatorId, createActionPlanDto);
  }

  @Get()
  async findAll(
    @Query('clientId') clientId: string | undefined,
    @Query('responsibleId') responsibleId: string | undefined,
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
    return this.actionPlansService.findAll(
      clientId,
      responsibleId,
      status,
      req.user,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithAuth) {
    const plan = await this.actionPlansService.findOne(id);
    await this.clientAccessPolicy.assertCanViewClient(
      req.user.id,
      req.user.role,
      plan.clientId,
    );
    return plan;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithAuth,
    @Body() updateActionPlanDto: UpdateActionPlanDto,
  ) {
    const plan = await this.actionPlansService.findOne(id);

    // Se for cancelamento, exige perfil de gerência/gestor responsável
    if (updateActionPlanDto.status === 'cancelled') {
      await this.clientAccessPolicy.assertCanManageClient(
        req.user.id,
        req.user.role,
        plan.clientId,
      );
    } else {
      // Se não for o criador nem o responsável, precisa de autorização de gerenciamento
      if (
        plan.responsibleId !== req.user.id &&
        plan.createdById !== req.user.id
      ) {
        await this.clientAccessPolicy.assertCanManageClient(
          req.user.id,
          req.user.role,
          plan.clientId,
        );
      } else {
        await this.clientAccessPolicy.assertCanOperateClient(
          req.user.id,
          req.user.role,
          plan.clientId,
        );
      }
    }

    const updaterId = req.user.id;
    return this.actionPlansService.update(id, updaterId, updateActionPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithAuth) {
    const plan = await this.actionPlansService.findOne(id);
    await this.clientAccessPolicy.assertCanManageClient(
      req.user.id,
      req.user.role,
      plan.clientId,
    );
    return this.actionPlansService.remove(id);
  }
}
