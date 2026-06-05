import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClientAccessPolicy } from '../common/policies/client-access.policy';

@Global()
@Module({
  providers: [PrismaService, ClientAccessPolicy],
  exports: [PrismaService, ClientAccessPolicy],
})
export class PrismaModule {}
