/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userID,gameID]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ratingID]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userID,gameID]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ratingID` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MOD', 'ADMIN');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "ratingID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userID_gameID_key" ON "Rating"("userID", "gameID");

-- CreateIndex
CREATE UNIQUE INDEX "Review_ratingID_key" ON "Review"("ratingID");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userID_gameID_key" ON "Review"("userID", "gameID");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ratingID_fkey" FOREIGN KEY ("ratingID") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
