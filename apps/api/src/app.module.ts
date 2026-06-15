import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/config/env.validation';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { ContractsModule } from './contracts/contracts.module';
import { DeliverableTypesModule } from './deliverable-types/deliverable-types.module';
import { MonthlyCyclesModule } from './monthly-cycles/monthly-cycles.module';
import { FollowupsModule } from './followups/followups.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ClickUpModule } from './clickup/clickup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    HealthModule,
    ClientsModule,
    UsersModule,
    ContractsModule,
    DeliverableTypesModule,
    MonthlyCyclesModule,
    FollowupsModule,
    ActionPlansModule,
    DashboardModule,
    AlertsModule,
    ServiceProvidersModule,
    CredentialsModule,
    ClickUpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
