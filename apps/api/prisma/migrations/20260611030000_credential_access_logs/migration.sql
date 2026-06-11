-- Create Table "service_providers"
CREATE TABLE "service_providers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "whatsapp" VARCHAR(30),
    "role" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_providers_email_key" ON "service_providers"("email");

-- Create Table "credentials"
CREATE TABLE "credentials" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "system_name" VARCHAR(100) NOT NULL,
    "url" TEXT,
    "username" VARCHAR(150) NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "credentials_client_id_idx" ON "credentials"("client_id");

ALTER TABLE "credentials" ADD CONSTRAINT "credentials_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
