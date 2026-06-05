import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { SquadsModule } from './squads/squads.module';
import { ContractsModule } from './contracts/contracts.module';
import { DeliverableTypesModule } from './deliverable-types/deliverable-types.module';
import { MonthlyCyclesModule } from './monthly-cycles/monthly-cycles.module';
import { FollowupsModule } from './followups/followups.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    ClientsModule,
    UsersModule,
    SquadsModule,
    ContractsModule,
    DeliverableTypesModule,
    MonthlyCyclesModule,
    FollowupsModule,
    ActionPlansModule,
    DashboardModule,
    AlertsModule,
  ],
})
export class AppModule {}
