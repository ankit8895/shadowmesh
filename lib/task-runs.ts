import { prisma } from "@/lib/prisma";

const taskRunSelect = {
  runId: true,
  projectId: true,
  userId: true,
  createdAt: true,
} as const;

export interface CreateTaskRunInput {
  runId: string;
  projectId: string;
  userId: string;
}

/** Records a triggered run so its ownership can be verified before tokens. */
export function createTaskRun(input: CreateTaskRunInput) {
  return prisma.taskRun.create({
    data: input,
    select: taskRunSelect,
  });
}

/** Looks up a run record by its Trigger.dev run ID. */
export function findTaskRun(runId: string) {
  return prisma.taskRun.findUnique({
    where: { runId },
    select: taskRunSelect,
  });
}

/** Counts runs a user started since a cutoff, for the start-run rate limit. */
export function countRecentTaskRuns(input: { userId: string; since: Date }) {
  return prisma.taskRun.count({
    where: { userId: input.userId, createdAt: { gte: input.since } },
  });
}
