import { runs, tasks } from "@trigger.dev/sdk";
import type { designAgent } from "@/trigger/design-agent";

import { jsonError } from "@/lib/api-response";
import { parseDesignInput } from "@/lib/design-input";
import { authorizeProjectAccess } from "@/lib/project-access";
import {
  countRecentTaskRuns,
  createTaskRun,
  RUN_RATE_LIMIT,
  RUN_RATE_WINDOW_MS,
} from "@/lib/task-runs";

/**
 * Starts a design generation run for a project the caller can open. The task is
 * triggered from its ID with a type-only import, so the task code is never
 * bundled into the app.
 */
export async function POST(request: Request) {
  const input = await parseDesignInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const access = await authorizeProjectAccess(input.data.projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to start a design run.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  try {
    const recentRuns = await countRecentTaskRuns({
      userId: access.viewer.userId,
      taskKey: "design-agent",
      since: new Date(Date.now() - RUN_RATE_WINDOW_MS),
    });

    if (recentRuns >= RUN_RATE_LIMIT) {
      return jsonError(
        429,
        "You are starting design runs too quickly. Wait a few minutes and try again.",
      );
    }

    const handle = await tasks.trigger<typeof designAgent>("design-agent", {
      prompt: input.data.prompt,
      roomId: input.data.roomId,
    });

    // Stored before the ID is handed out, so the token route can verify the
    // caller owns the run it names.
    try {
      await createTaskRun({
        runId: handle.id,
        projectId: input.data.projectId,
        userId: access.viewer.userId,
        taskKey: "design-agent",
      });
    } catch (error) {
      console.error("Unable to record the design run.", error);

      // The task is already queued, so an unrecorded run would keep spending
      // model calls while no client could ever be issued a token for it.
      try {
        await runs.cancel(handle.id);
      } catch (cancelError) {
        console.error("Unable to cancel the unrecorded design run.", cancelError);
      }

      return jsonError(500, "Unable to start a design run.");
    }

    return Response.json({ runId: handle.id }, { status: 201 });
  } catch (error) {
    console.error("Unable to start a design run.", error);

    return jsonError(500, "Unable to start a design run.");
  }
}
