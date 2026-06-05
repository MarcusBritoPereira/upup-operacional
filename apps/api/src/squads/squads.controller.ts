import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SquadsService } from './squads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('squads')
@UseGuards(JwtAuthGuard)
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Get()
  findAll() {
    return this.squadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.squadsService.findOne(id);
  }
}
