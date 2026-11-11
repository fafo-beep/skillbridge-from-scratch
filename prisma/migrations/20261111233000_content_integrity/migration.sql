-- Earlier seeds recreated outcomes with new ids on every deploy, which left
-- narratives and evidence pointing at outcomes that no longer exist. Those
-- rows cannot be shown or recovered (the outcome they described is gone),
-- so they are removed before the relation is enforced. From here on the
-- seed upserts by position and the database refuses to orphan content.
DELETE FROM "OutcomeResponse" WHERE "outcomeId" NOT IN (SELECT "id" FROM "Outcome");
DELETE FROM "Evidence" WHERE "outcomeId" NOT IN (SELECT "id" FROM "Outcome");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_position_key" ON "Lesson"("moduleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_position_key" ON "Module"("courseId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_courseId_position_key" ON "Outcome"("courseId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_courseId_key" ON "Portfolio"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "OutcomeResponse" ADD CONSTRAINT "OutcomeResponse_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
