import { auth } from "@trigger.dev/sdk";

import { jsonError } from "@/lib/api-response";
import { readJsonObject } from "@/lib/project-input";
import { getAuthenticatedUserId } from "@/lib/project-access";
import { findTaskRun } from "@/lib/task-runs";

const MAX_RUN_ID_LENGTH = 64;
const RUN_ID_PATTERN = /^run_[A-Za-z0-9_-]+$/;

/**
 * Issues a Trigger.dev public token that can read exactly one run, after the
 * stored run record proves the caller started it. Used by both AI token routes
 * so design and spec subscriptions share one ownership check and scope.
 *
 * `runLabel` only names the run type in user-facing messages.
 */
export async function issueRunToken(
  request: Request,
  runLabel: string,
): Promise<Response> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError(
      401,
      `You must be signed in to watch a ${runLabel} run.`,
    );
  }

  const body = await readJsonObject(request);

  if (!body.ok) {
    return jsonError(400, body.error);
  }

  const { runId } = body.data;

  if (typeof runId !== "string" || runId.trim() === "") {
    return jsonError(400, "A run ID is required.");
  }

  const trimmedRunId = runId.trim();

  if (
    trimmedRunId.length > MAX_RUN_ID_LENGTH ||
    !RUN_ID_PATTERN.test(trimmedRunId)
  ) {
    return jsonError(400, "Enter a valid run ID.");
  }

  const taskRun = await findTaskRun(trimmedRunId);

  if (!taskRun) {
    return jsonError(404, "Run not found.");
  }

  if (taskRun.userId !== userId) {
    return jsonError(403, "You did not start this run.");
  }

  try {
    const token = await auth.createPublicToken({
      scopes: { read: { runs: [taskRun.runId] } },
      expirationTime: "1h",
    });

    return Response.json({ token });
  } catch (error) {
    console.error("Unable to create a run token.", error);

    return jsonError(500, "Unable to create a run token.");
  }
}
