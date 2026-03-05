-- AlterTable: remove unique constraint on samples.name
ALTER TABLE "samples" DROP CONSTRAINT IF EXISTS "samples_name_key";
