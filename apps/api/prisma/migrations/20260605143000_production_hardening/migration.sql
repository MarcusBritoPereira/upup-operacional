-- Production hardening: typed domains, integrity constraints, query indexes,
-- and alert resolution auditing.

-- Fail early with actionable messages if legacy data violates new constraints.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "squad_members"
    GROUP BY "squad_id", "user_id" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate squad_members must be removed before this migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "monthly_deliverables"
    GROUP BY "monthly_cycle_id", "deliverable_type_id" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate monthly_deliverables must be removed before this migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "weekly_followups"
    GROUP BY "monthly_cycle_id", "week_start" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate weekly_followups must be removed before this migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "deliverable_types"
    GROUP BY "name" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate deliverable type names must be removed before this migration';
  END IF;
END $$;

CREATE TYPE "UserRole" AS ENUM ('admin', 'diretoria', 'gerencia', 'gestor_cliente', 'colaborador');
CREATE TYPE "ClientStatus" AS ENUM ('active', 'inactive', 'churned');
CREATE TYPE "ContractStatus" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "CycleStatus" AS ENUM ('open', 'closed');
CREATE TYPE "HealthStatus" AS ENUM ('green', 'yellow', 'red', 'gray');
CREATE TYPE "DeliverableStatus" AS ENUM ('pending', 'delivered', 'in_progress', 'delayed');
CREATE TYPE "ActionPlanStatus" AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "ActionPlanPriority" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "AlertStatus" AS ENUM ('open', 'resolved');

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole";

ALTER TABLE "clients" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "clients"
  ALTER COLUMN "status" TYPE "ClientStatus" USING "status"::text::"ClientStatus";
ALTER TABLE "clients" ALTER COLUMN "status" SET DEFAULT 'active';

ALTER TABLE "contracts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contracts"
  ALTER COLUMN "status" TYPE "ContractStatus" USING "status"::text::"ContractStatus";
ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'active';

ALTER TABLE "monthly_cycles" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "monthly_cycles" ALTER COLUMN "health_status" DROP DEFAULT;
ALTER TABLE "monthly_cycles"
  ALTER COLUMN "status" TYPE "CycleStatus" USING "status"::text::"CycleStatus",
  ALTER COLUMN "health_status" TYPE "HealthStatus" USING "health_status"::text::"HealthStatus";
ALTER TABLE "monthly_cycles" ALTER COLUMN "status" SET DEFAULT 'open';
ALTER TABLE "monthly_cycles" ALTER COLUMN "health_status" SET DEFAULT 'gray';

ALTER TABLE "monthly_deliverables" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "monthly_deliverables"
  ALTER COLUMN "status" TYPE "DeliverableStatus" USING "status"::text::"DeliverableStatus";
ALTER TABLE "monthly_deliverables" ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "client_health_snapshots"
  ALTER COLUMN "status" TYPE "HealthStatus" USING "status"::text::"HealthStatus";

ALTER TABLE "action_plans" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "action_plans" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "action_plans"
  ALTER COLUMN "priority" TYPE "ActionPlanPriority" USING "priority"::text::"ActionPlanPriority",
  ALTER COLUMN "status" TYPE "ActionPlanStatus" USING "status"::text::"ActionPlanStatus";
ALTER TABLE "action_plans" ALTER COLUMN "priority" SET DEFAULT 'medium';
ALTER TABLE "action_plans" ALTER COLUMN "status" SET DEFAULT 'open';

ALTER TABLE "alerts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "alerts"
  ALTER COLUMN "severity" TYPE "AlertSeverity" USING "severity"::text::"AlertSeverity",
  ALTER COLUMN "status" TYPE "AlertStatus" USING "status"::text::"AlertStatus";
ALTER TABLE "alerts" ALTER COLUMN "status" SET DEFAULT 'open';
ALTER TABLE "alerts" ADD COLUMN "resolved_by_id" UUID;

CREATE UNIQUE INDEX "squad_members_squad_id_user_id_key"
  ON "squad_members"("squad_id", "user_id");
CREATE INDEX "clients_status_manager_id_idx"
  ON "clients"("status", "manager_id");
CREATE INDEX "clients_status_squad_id_idx"
  ON "clients"("status", "squad_id");
CREATE INDEX "contracts_client_id_status_idx"
  ON "contracts"("client_id", "status");
CREATE UNIQUE INDEX "deliverable_types_name_key"
  ON "deliverable_types"("name");
CREATE UNIQUE INDEX "monthly_deliverables_monthly_cycle_id_deliverable_type_id_key"
  ON "monthly_deliverables"("monthly_cycle_id", "deliverable_type_id");
CREATE UNIQUE INDEX "weekly_followups_monthly_cycle_id_week_start_key"
  ON "weekly_followups"("monthly_cycle_id", "week_start");
CREATE INDEX "weekly_followups_client_id_monthly_cycle_id_week_start_idx"
  ON "weekly_followups"("client_id", "monthly_cycle_id", "week_start");
CREATE INDEX "action_plans_client_id_responsible_id_status_due_date_idx"
  ON "action_plans"("client_id", "responsible_id", "status", "due_date");
CREATE INDEX "alerts_client_id_status_created_at_idx"
  ON "alerts"("client_id", "status", "created_at");
CREATE INDEX "client_timeline_client_id_created_at_idx"
  ON "client_timeline"("client_id", "created_at");

ALTER TABLE "alerts"
  ADD CONSTRAINT "alerts_resolved_by_id_fkey"
  FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
