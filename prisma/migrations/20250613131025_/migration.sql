/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `UploadContentRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branchId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "branchId" INTEGER NOT NULL,
ADD COLUMN     "semesterId" INTEGER NOT NULL,
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UploadContentRequest_contentId_key" ON "UploadContentRequest"("contentId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
