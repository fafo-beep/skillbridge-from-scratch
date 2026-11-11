-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN "fileKey" TEXT,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "fileType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_fileKey_key" ON "Evidence"("fileKey");
