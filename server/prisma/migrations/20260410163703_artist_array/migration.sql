/*
  Warnings:

  - The `artist` column on the `Song` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "artist",
ADD COLUMN     "artist" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_artist_key" ON "Song"("title", "artist");
