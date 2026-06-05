-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(30),
    "role" VARCHAR(50) NOT NULL,
    "department" VARCHAR(80),
    "position" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "leader_id" UUID,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_members" (
    "id" UUID NOT NULL,
    "squad_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "trade_name" VARCHAR(150) NOT NULL,
    "legal_name" VARCHAR(180),
    "segment" VARCHAR(100),
    "status" VARCHAR(40) NOT NULL DEFAULT 'active',
    "entry_date" DATE NOT NULL,
    "exit_date" DATE,
    "exit_reason" TEXT,
    "monthly_contract_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "manager_id" UUID,
    "squad_id" UUID,
    "decision_maker_name" VARCHAR(150),
    "decision_maker_phone" VARCHAR(30),
    "decision_maker_email" VARCHAR(150),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "instagram_url" TEXT,
    "drive_url" TEXT,
    "clickup_url" TEXT,
    "whatsapp_group_url" TEXT,
    "client_profile" VARCHAR(80),
    "marketing_maturity" VARCHAR(40),
    "strategic_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "monthly_value" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_cycles" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "manager_id" UUID,
    "status" VARCHAR(40) NOT NULL DEFAULT 'open',
    "health_score" INTEGER,
    "health_status" VARCHAR(30) NOT NULL DEFAULT 'gray',
    "closing_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_deliverables" (
    "id" UUID NOT NULL,
    "monthly_cycle_id" UUID NOT NULL,
    "deliverable_type_id" UUID NOT NULL,
    "contracted_quantity" INTEGER NOT NULL DEFAULT 0,
    "delivered_quantity" INTEGER NOT NULL DEFAULT 0,
    "in_progress_quantity" INTEGER NOT NULL DEFAULT 0,
    "delayed_quantity" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(40) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_followups" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "monthly_cycle_id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "group_activated" VARCHAR(30),
    "client_responded" VARCHAR(30),
    "agency_responded_on_time" VARCHAR(30),
    "calendar_on_track" VARCHAR(30),
    "has_delayed_delivery" BOOLEAN NOT NULL DEFAULT false,
    "client_showed_dissatisfaction" BOOLEAN NOT NULL DEFAULT false,
    "churn_risk" VARCHAR(30),
    "weekly_score" INTEGER NOT NULL,
    "manager_notes" TEXT,
    "recommended_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_followups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_health_snapshots" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "monthly_cycle_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_plans" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "monthly_cycle_id" UUID,
    "problem" TEXT NOT NULL,
    "probable_cause" TEXT,
    "action" TEXT NOT NULL,
    "responsible_id" UUID,
    "due_date" DATE,
    "priority" VARCHAR(30) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(40) NOT NULL DEFAULT 'open',
    "result" TEXT,
    "learning" TEXT,
    "can_become_playbook" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "alert_type" VARCHAR(80) NOT NULL,
    "severity" VARCHAR(30) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(40) NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_timeline" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "event_type" VARCHAR(80) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "churn_reasons" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "exit_date" DATE NOT NULL,
    "reason_category" VARCHAR(100),
    "detailed_reason" TEXT,
    "could_have_been_prevented" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churn_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_cycles_client_id_month_year_key" ON "monthly_cycles"("client_id", "month", "year");

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_cycles" ADD CONSTRAINT "monthly_cycles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_cycles" ADD CONSTRAINT "monthly_cycles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_deliverables" ADD CONSTRAINT "monthly_deliverables_monthly_cycle_id_fkey" FOREIGN KEY ("monthly_cycle_id") REFERENCES "monthly_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_deliverables" ADD CONSTRAINT "monthly_deliverables_deliverable_type_id_fkey" FOREIGN KEY ("deliverable_type_id") REFERENCES "deliverable_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_followups" ADD CONSTRAINT "weekly_followups_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_followups" ADD CONSTRAINT "weekly_followups_monthly_cycle_id_fkey" FOREIGN KEY ("monthly_cycle_id") REFERENCES "monthly_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_followups" ADD CONSTRAINT "weekly_followups_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_health_snapshots" ADD CONSTRAINT "client_health_snapshots_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_health_snapshots" ADD CONSTRAINT "client_health_snapshots_monthly_cycle_id_fkey" FOREIGN KEY ("monthly_cycle_id") REFERENCES "monthly_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_monthly_cycle_id_fkey" FOREIGN KEY ("monthly_cycle_id") REFERENCES "monthly_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_timeline" ADD CONSTRAINT "client_timeline_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_timeline" ADD CONSTRAINT "client_timeline_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "churn_reasons" ADD CONSTRAINT "churn_reasons_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
