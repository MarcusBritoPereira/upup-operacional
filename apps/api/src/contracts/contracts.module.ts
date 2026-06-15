import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { ContractsCronService } from './contracts.cron';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [PrismaModule, AlertsModule],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsCronService],
  exports: [ContractsService],
})
export class ContractsModule {}
