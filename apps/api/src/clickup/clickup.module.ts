import { Module } from '@nestjs/common';
import { ClickUpController } from './clickup.controller';
import { ClickUpService } from './clickup.service';
import { ClickUpApiClient } from './clickup-api.client';

@Module({
  controllers: [ClickUpController],
  providers: [ClickUpService, ClickUpApiClient],
  exports: [ClickUpService],
})
export class ClickUpModule {}
