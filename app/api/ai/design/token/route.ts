import { auth } from "@trigger.dev/sdk";

import { jsonError } from "@/lib/api-response";
import { parseDesignTokenInput } from "@/lib/design-input";
import { getAuthenticatedUserId } from "@/lib/project-access";
import { findTaskRun } from "@/lib/task-runs";

/**
 * Issues a Trigger.dev public token that can read exactly one run, after the
 * stored run record proves the caller started it. A token with no scopes grants
 * nothing, so the scope is required rather than optional.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError(401, "You must be signed in to watch a design run.");
  }

  const input = await parseDesignTokenInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const taskRun = await findTaskRun(input.data.runId);

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
