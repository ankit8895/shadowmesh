import { runs, tasks } from "@trigger.dev/sdk";
import type { generateSpec } from "@/trigger/generate-spec";

import { jsonError } from "@/lib/api-response";
import { authorizeProjectAccess } from "@/lib/project-access";
import { parseSpecInput } from "@/lib/spec-input";
import {
  countRecentTaskRuns,
  createTaskRun,
  RUN_RATE_LIMIT,
  RUN_RATE_WINDOW_MS,
} from "@/lib/task-runs";

/**
 * Starts a spec generation run from the canvas and chat context a caller can
 * see. Access and the project ID both come from the authorized Liveblocks room,
 * so a client cannot point the run at another project.
 */
export async function POST(request: Request) {
  const input = await parseSpecInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const access = await authorizeProjectAccess(input.data.roomId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to generate a spec.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  // The room ID is the project ID; taking it from the authorized room rather
  // than the request is what keeps another project's canvas unreachable.
  const projectId = input.data.roomId;

  try {
    const recentRuns = await countRecentTaskRuns({
      userId: access.viewer.userId,
      taskKey: "generate-spec",
      since: new Date(Date.now() - RUN_RATE_WINDOW_MS),
    });

    if (recentRuns >= RUN_RATE_LIMIT) {
      return jsonError(
        429,
        "You are generating specs too quickly. Wait a few minutes and try again.",
      );
    }

    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId,
      roomId: input.data.roomId,
      chatHistory: input.data.chatHistory,
      nodes: input.data.nodes,
      edges: input.data.edges,
    });

    // Stored before the ID is handed out, so the token route can verify the
    // caller owns the run it names.
    try {
      await createTaskRun({
        runId: handle.id,
        projectId,
        userId: access.viewer.userId,
        taskKey: "generate-spec",
      });
    } catch (error) {
      console.error("Unable to record the spec run.", error);

      // The task is already queued, so an unrecorded run would keep spending
      // model calls while no client could ever be issued a token for it.
      try {
        await runs.cancel(handle.id);
      } catch (cancelError) {
        console.error("Unable to cancel the unrecorded spec run.", cancelError);
      }

      return jsonError(500, "Unable to generate a spec.");
    }

    return Response.json({ runId: handle.id }, { status: 201 });
  } catch (error) {
    console.error("Unable to start a spec run.", error);

    return jsonError(500, "Unable to generate a spec.");
  }
}
