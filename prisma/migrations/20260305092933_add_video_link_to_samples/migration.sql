-- AlterTable
ALTER TABLE "samples" ADD COLUMN     "video_link" TEXT,
ALTER COLUMN "audio" DROP NOT NULL;
