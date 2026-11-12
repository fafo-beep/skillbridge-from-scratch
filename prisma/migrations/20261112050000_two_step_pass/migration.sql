-- CreateTable
CREATE TABLE "TwoStepPass" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoStepPass_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE INDEX "TwoStepPass_createdAt_idx" ON "TwoStepPass"("createdAt");
