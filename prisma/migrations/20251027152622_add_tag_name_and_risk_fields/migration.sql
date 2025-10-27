-- CreateEnum
CREATE TYPE "Risk" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "risk" "Risk" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "tag_name" TEXT NOT NULL DEFAULT 'LEGACY';

-- Update existing records with unique tag names
UPDATE "Submission" SET "tag_name" = 'LEGACY-' || "id" WHERE "tag_name" = 'LEGACY';

-- Now make it required without default
ALTER TABLE "Submission" ALTER COLUMN "tag_name" DROP DEFAULT;
