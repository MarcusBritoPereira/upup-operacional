import { Module } from '@nestjs/common';
import { MonthlyCyclesService } from './monthly-cycles.service';
import { MonthlyCyclesController } from './monthly-cycles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyCyclesController],
  providers: [MonthlyCyclesService],
  exports: [MonthlyCyclesService],
})
export class MonthlyCyclesModule {}
