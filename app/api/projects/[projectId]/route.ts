import { jsonError } from "@/lib/api-response";
import { authorizeProjectOwner } from "@/lib/project-access";
import { parseRenameProjectInput } from "@/lib/project-input";
import { deleteProject, renameProject } from "@/lib/project-store";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: ProjectRouteContext,
) {
  const { projectId } = await params;
  const authorization = await authorizeProjectOwner(projectId);

  if (authorization.status === "unauthenticated") {
    return jsonError(401, "Unauthorized.");
  }

  if (authorization.status === "not-found") {
    return jsonError(404, "Project not found.");
  }

  if (authorization.status === "forbidden") {
    return jsonError(403, "Only the project owner can rename this project.");
  }

  const input = await parseRenameProjectInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const project = await renameProject(projectId, input.data.name);

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: ProjectRouteContext,
) {
  const { projectId } = await params;
  const authorization = await authorizeProjectOwner(projectId);

  if (authorization.status === "unauthenticated") {
    return jsonError(401, "Unauthorized.");
  }

  if (authorization.status === "not-found") {
    return jsonError(404, "Project not found.");
  }

  if (authorization.status === "forbidden") {
    return jsonError(403, "Only the project owner can delete this project.");
  }

  await deleteProject(projectId);

  return new Response(null, { status: 204 });
}
