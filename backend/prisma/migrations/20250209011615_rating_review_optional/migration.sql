-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_ratingID_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "ratingID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ratingID_fkey" FOREIGN KEY ("ratingID") REFERENCES "Rating"("id") ON DELETE SET NULL ON UPDATE CASCADE;
