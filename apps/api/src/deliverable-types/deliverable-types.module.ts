import { Module } from '@nestjs/common';
import { DeliverableTypesService } from './deliverable-types.service';
import { DeliverableTypesController } from './deliverable-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliverableTypesController],
  providers: [DeliverableTypesService],
  exports: [DeliverableTypesService],
})
export class DeliverableTypesModule {}
