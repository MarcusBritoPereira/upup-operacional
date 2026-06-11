ALTER TABLE "client_service_providers" ADD COLUMN "role" VARCHAR(100) NOT NULL DEFAULT 'ServiceProvider';

DROP INDEX IF EXISTS "client_service_providers_client_id_service_provider_id_key";

CREATE UNIQUE INDEX "client_service_providers_client_id_service_provider_id_role_key" ON "client_service_providers"("client_id", "service_provider_id", "role");
