/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contentId` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contentId` on table `RelatedVideo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Semester` required. This step will fail if there are existing NULL values in that column.
  - Made the column `semesterId` on table `Subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subjectId` on table `Unit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_fileId_fkey";

-- DropForeignKey
ALTER TABLE "RelatedVideo" DROP CONSTRAINT "RelatedVideo_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_subjectId_fkey";

-- DropIndex
DROP INDEX "Content_fileId_key";

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "fileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "contentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RelatedVideo" ALTER COLUMN "contentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Semester" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "semesterId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "subjectId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_contentId_key" ON "File"("contentId");

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedVideo" ADD CONSTRAINT "RelatedVideo_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
