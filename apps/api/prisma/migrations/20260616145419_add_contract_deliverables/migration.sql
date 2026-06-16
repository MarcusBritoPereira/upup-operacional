-- CreateTable
CREATE TABLE "contract_deliverables" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "deliverable_type_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contract_deliverables_contract_id_idx" ON "contract_deliverables"("contract_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_deliverables_contract_id_deliverable_type_id_key" ON "contract_deliverables"("contract_id", "deliverable_type_id");

-- AddForeignKey
ALTER TABLE "contract_deliverables" ADD CONSTRAINT "contract_deliverables_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_deliverables" ADD CONSTRAINT "contract_deliverables_deliverable_type_id_fkey" FOREIGN KEY ("deliverable_type_id") REFERENCES "deliverable_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
