-- AlterTable
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_squad_id_fkey";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "squad_id";

-- DropForeignKey
ALTER TABLE "squad_members" DROP CONSTRAINT IF EXISTS "squad_members_squad_id_fkey";
ALTER TABLE "squad_members" DROP CONSTRAINT IF EXISTS "squad_members_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "squad_members";
DROP TABLE IF EXISTS "squads";

-- CreateTable
CREATE TABLE "client_team_members" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_team_members_client_id_user_id_role_key" ON "client_team_members"("client_id", "user_id", "role");

-- AddForeignKey
ALTER TABLE "client_team_members" ADD CONSTRAINT "client_team_members_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_team_members" ADD CONSTRAINT "client_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
