-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paymentIntentId" TEXT,
ADD COLUMN "refundedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");
