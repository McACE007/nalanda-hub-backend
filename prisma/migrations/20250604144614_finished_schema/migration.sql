/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `RelatedVideos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadContentRequestStatus" AS ENUM ('Approved', 'Rejected', 'Pending');

-- CreateEnum
CREATE TYPE "NewContentRequestType" AS ENUM ('NewContent', 'UpdateContent');

-- AlterTable
CREATE SEQUENCE admin_id_seq;
ALTER TABLE "Admin" ALTER COLUMN "id" SET DEFAULT nextval('admin_id_seq');
ALTER SEQUENCE admin_id_seq OWNED BY "Admin"."id";

-- AlterTable
CREATE SEQUENCE branch_id_seq;
ALTER TABLE "Branch" ALTER COLUMN "id" SET DEFAULT nextval('branch_id_seq');
ALTER SEQUENCE branch_id_seq OWNED BY "Branch"."id";

-- AlterTable
CREATE SEQUENCE content_id_seq;
ALTER TABLE "Content" ADD COLUMN     "fileId" BIGINT NOT NULL,
ADD COLUMN     "unitId" BIGINT NOT NULL,
ADD COLUMN     "uploadedBy" BIGINT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('content_id_seq'),
ALTER COLUMN "uploadedDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT false;
ALTER SEQUENCE content_id_seq OWNED BY "Content"."id";

-- AlterTable
CREATE SEQUENCE file_id_seq;
ALTER TABLE "File" ADD COLUMN     "contentId" BIGINT,
ALTER COLUMN "id" SET DEFAULT nextval('file_id_seq');
ALTER SEQUENCE file_id_seq OWNED BY "File"."id";

-- AlterTable
CREATE SEQUENCE notification_id_seq;
ALTER TABLE "Notification" ADD COLUMN     "adminId" BIGINT,
ADD COLUMN     "moderatorId" BIGINT,
ADD COLUMN     "userId" BIGINT,
ALTER COLUMN "id" SET DEFAULT nextval('notification_id_seq');
ALTER SEQUENCE notification_id_seq OWNED BY "Notification"."id";

-- AlterTable
CREATE SEQUENCE semester_id_seq;
ALTER TABLE "Semester" ADD COLUMN     "branchId" BIGINT,
ALTER COLUMN "id" SET DEFAULT nextval('semester_id_seq');
ALTER SEQUENCE semester_id_seq OWNED BY "Semester"."id";

-- AlterTable
CREATE SEQUENCE subject_id_seq;
ALTER TABLE "Subject" ADD COLUMN     "semesterId" BIGINT,
ALTER COLUMN "id" SET DEFAULT nextval('subject_id_seq');
ALTER SEQUENCE subject_id_seq OWNED BY "Subject"."id";

-- AlterTable
CREATE SEQUENCE unit_id_seq;
ALTER TABLE "Unit" ADD COLUMN     "subjectId" BIGINT,
ALTER COLUMN "id" SET DEFAULT nextval('unit_id_seq');
ALTER SEQUENCE unit_id_seq OWNED BY "Unit"."id";

-- AlterTable
CREATE SEQUENCE user_id_seq;
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "branchId" BIGINT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('user_id_seq');
ALTER SEQUENCE user_id_seq OWNED BY "User"."id";

-- DropTable
DROP TABLE "RelatedVideos";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Moderator" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "branchId" BIGINT NOT NULL,

    CONSTRAINT "Moderator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedVideo" (
    "id" BIGSERIAL NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "videoDescription" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "contentId" BIGINT,

    CONSTRAINT "RelatedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadContentRequest" (
    "id" BIGSERIAL NOT NULL,
    "status" "UploadContentRequestStatus" NOT NULL DEFAULT 'Pending',
    "userId" BIGINT NOT NULL,
    "branchId" BIGINT NOT NULL,
    "contentId" BIGINT NOT NULL,
    "semesterId" BIGINT NOT NULL,
    "subjectId" BIGINT NOT NULL,
    "unitId" BIGINT NOT NULL,
    "moderatorId" BIGINT NOT NULL,
    "adminId" BIGINT NOT NULL,

    CONSTRAINT "UploadContentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewContentRequest" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "newContentUrl" TEXT,
    "requestType" "NewContentRequestType" NOT NULL,
    "userId" BIGINT NOT NULL,
    "moderatorId" BIGINT NOT NULL,
    "adminId" BIGINT NOT NULL,
    "branchId" BIGINT NOT NULL,
    "semesterId" BIGINT NOT NULL,
    "subjectId" BIGINT NOT NULL,
    "unitId" BIGINT NOT NULL,

    CONSTRAINT "NewContentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Moderator_email_key" ON "Moderator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Content_fileId_key" ON "Content"("fileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderator" ADD CONSTRAINT "Moderator_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedVideo" ADD CONSTRAINT "RelatedVideo_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadContentRequest" ADD CONSTRAINT "UploadContentRequest_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewContentRequest" ADD CONSTRAINT "NewContentRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
