import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MonthlyCyclesService } from './monthly-cycles.service';
import { InitializeCycleDto } from './dto/initialize-cycle.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('monthly-cycles')
@UseGuards(JwtAuthGuard)
export class MonthlyCyclesController {
  constructor(private readonly monthlyCyclesService: MonthlyCyclesService) {}

  @Get()
  findAll(@Query('clientId') clientId: string) {
    return this.monthlyCyclesService.findAll(clientId);
  }

  @Post('initialize')
  initialize(@Body() initializeCycleDto: InitializeCycleDto) {
    return this.monthlyCyclesService.initialize(initializeCycleDto);
  }

  @Patch('deliverables/:id')
  updateDeliverable(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto,
  ) {
    return this.monthlyCyclesService.updateDeliverable(id, updateDeliverableDto);
  }
}
