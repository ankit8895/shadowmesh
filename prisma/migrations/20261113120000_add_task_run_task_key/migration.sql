-- AlterTable
ALTER TABLE "TaskRun" ADD COLUMN "taskKey" TEXT;

-- CreateIndex
CREATE INDEX "TaskRun_userId_taskKey_createdAt_idx" ON "TaskRun"("userId", "taskKey", "createdAt");
