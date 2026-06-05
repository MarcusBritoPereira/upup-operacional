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
import { DeliverableTypesService } from './deliverable-types.service';
import { CreateDeliverableTypeDto } from './dto/create-deliverable-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('deliverable-types')
@UseGuards(JwtAuthGuard)
export class DeliverableTypesController {
  constructor(
    private readonly deliverableTypesService: DeliverableTypesService,
  ) {}

  @Post()
  create(@Body() createDeliverableTypeDto: CreateDeliverableTypeDto) {
    return this.deliverableTypesService.create(createDeliverableTypeDto);
  }

  @Get()
  findAll(@Query('all') all?: string) {
    const onlyActive = all !== 'true';
    return this.deliverableTypesService.findAll(onlyActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliverableTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateDeliverableTypeDto>,
  ) {
    return this.deliverableTypesService.update(id, updateDto);
  }
}
