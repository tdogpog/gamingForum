/*
  Warnings:

  - You are about to drop the column `name` on the `Genre` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[genreName]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `genreName` to the `Genre` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Genre_name_key";

-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "name",
ADD COLUMN     "genreName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_genreName_key" ON "Genre"("genreName");
