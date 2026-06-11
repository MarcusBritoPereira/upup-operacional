-- CreateTable
CREATE TABLE "client_service_providers" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "service_provider_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_service_providers_client_id_idx" ON "client_service_providers"("client_id");

-- CreateIndex
CREATE INDEX "client_service_providers_service_provider_id_idx" ON "client_service_providers"("service_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_service_providers_client_id_service_provider_id_key" ON "client_service_providers"("client_id", "service_provider_id");

-- AddForeignKey
ALTER TABLE "client_service_providers" ADD CONSTRAINT "client_service_providers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_service_providers" ADD CONSTRAINT "client_service_providers_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
