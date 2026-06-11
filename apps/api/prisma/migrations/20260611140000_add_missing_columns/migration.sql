ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "tax_percentage" DECIMAL(5,2);
ALTER TABLE "weekly_followups" ADD COLUMN IF NOT EXISTS "content_generated_quantity" INTEGER;
ALTER TABLE "weekly_followups" ADD COLUMN IF NOT EXISTS "ads_performance_summary" TEXT;
