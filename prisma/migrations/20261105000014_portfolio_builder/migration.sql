-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decisionNote" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "evaluatorId" TEXT,
ADD COLUMN     "score" INTEGER;

-- CreateTable
CREATE TABLE "OutcomeResponse" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "narrative" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutcomeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeResponse_portfolioId_outcomeId_key" ON "OutcomeResponse"("portfolioId", "outcomeId");

-- AddForeignKey
ALTER TABLE "OutcomeResponse" ADD CONSTRAINT "OutcomeResponse_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
