-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN "verifyCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_verifyCode_key" ON "Portfolio"("verifyCode");
