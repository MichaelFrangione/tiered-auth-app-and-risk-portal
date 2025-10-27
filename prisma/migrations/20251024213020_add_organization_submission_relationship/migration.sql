-- Add columns with default values first
ALTER TABLE "Submission" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Submission" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Update existing submissions to use the organization from their user
UPDATE "Submission" 
SET "organizationId" = (
    SELECT "organizationId" 
    FROM "User" 
    WHERE "User"."id" = "Submission"."userId"
);

-- Now make the columns NOT NULL
ALTER TABLE "Submission" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Submission" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
