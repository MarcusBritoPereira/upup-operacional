-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "gee_fixed_value" DECIMAL(12,2),
ADD COLUMN     "gee_percentage" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "weekly_followups" DROP COLUMN IF EXISTS "ads_performance_summary";
