-- Audit trail for sensitive credential access.
CREATE TABLE "credential_access_logs" (
  "id" UUID NOT NULL,
  "credential_id" UUID NOT NULL,
  "user_id" UUID,
  "action" VARCHAR(80) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "credential_access_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "credential_access_logs_credential_id_created_at_idx" ON "credential_access_logs"("credential_id", "created_at");
CREATE INDEX "credential_access_logs_user_id_created_at_idx" ON "credential_access_logs"("user_id", "created_at");

ALTER TABLE "credential_access_logs"
  ADD CONSTRAINT "credential_access_logs_credential_id_fkey"
  FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credential_access_logs"
  ADD CONSTRAINT "credential_access_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
