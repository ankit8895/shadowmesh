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
  /** Trigger.dev task ID, so each AI feature gets its own rate limit. */
  taskKey: string;
}

/**
 * Every AI run costs a model call, so one user cannot start them without
 * limit. Each task has its own rolling window, so generating specs never uses
 * up the design budget.
 */
export const RUN_RATE_LIMIT = 10;
export const RUN_RATE_WINDOW_MS = 10 * 60 * 1000;

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

/**
 * Counts the runs one user started for a task since a cutoff, for the
 * start-run rate limit.
 */
export function countRecentTaskRuns(input: {
  userId: string;
  taskKey: string;
  since: Date;
}) {
  return prisma.taskRun.count({
    where: {
      userId: input.userId,
      taskKey: input.taskKey,
      createdAt: { gte: input.since },
    },
  });
}
