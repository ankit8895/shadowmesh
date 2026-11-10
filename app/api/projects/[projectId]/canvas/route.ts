import { jsonError } from "@/lib/api-response";
import { readCanvasSnapshotRequest } from "@/lib/canvas-snapshot";
import { loadProjectCanvas, saveProjectCanvas } from "@/lib/canvas-store";
import { authorizeProjectAccess } from "@/lib/project-access";

interface CanvasRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Returns the saved canvas state for a project, or `{ canvas: null }` when the
 * project has never been saved. `/api` is exempt from `proxy.ts`, so the route
 * authenticates and answers with JSON errors itself.
 */
export async function GET(_request: Request, { params }: CanvasRouteContext) {
  const { projectId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to open a project.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  try {
    const canvas = await loadProjectCanvas(projectId);

    return Response.json({ canvas });
  } catch (error) {
    console.error("Unable to load the saved canvas.", error);

    return jsonError(500, "Unable to load the saved canvas.");
  }
}

/**
 * Saves the latest canvas JSON to Vercel Blob and points the project record at
 * the new blob URL. Owners and invited collaborators can both save.
 */
export async function PUT(request: Request, { params }: CanvasRouteContext) {
  const { projectId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to save a project.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  const input = await readCanvasSnapshotRequest(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  try {
    await saveProjectCanvas(projectId, input.data);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to save the canvas.", error);

    return jsonError(500, "Unable to save the canvas.");
  }
}
