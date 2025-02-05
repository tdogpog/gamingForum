/*
  Warnings:

  - Added the required column `slug` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Genre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "parentGenre" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Genre" ADD CONSTRAINT "Genre_parentGenre_fkey" FOREIGN KEY ("parentGenre") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
