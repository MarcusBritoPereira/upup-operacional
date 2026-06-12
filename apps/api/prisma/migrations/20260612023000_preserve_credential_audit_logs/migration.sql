ALTER TABLE "credential_access_logs" DROP CONSTRAINT IF EXISTS "credential_access_logs_credential_id_fkey";

ALTER TABLE "credential_access_logs" ALTER COLUMN "credential_id" DROP NOT NULL;

ALTER TABLE "credential_access_logs"
  ADD CONSTRAINT "credential_access_logs_credential_id_fkey"
  FOREIGN KEY ("credential_id") REFERENCES "credentials"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
