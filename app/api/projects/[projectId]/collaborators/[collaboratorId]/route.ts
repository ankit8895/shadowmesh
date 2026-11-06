import { jsonError } from "@/lib/api-response";
import { removeCollaborator } from "@/lib/collaborators";
import { authorizeProjectOwner } from "@/lib/project-access";

interface CollaboratorRouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: CollaboratorRouteContext,
) {
  const { projectId, collaboratorId } = await params;
  const authorization = await authorizeProjectOwner(projectId);

  if (authorization.status === "unauthenticated") {
    return jsonError(401, "Unauthorized.");
  }

  if (authorization.status === "not-found") {
    return jsonError(404, "Project not found.");
  }

  if (authorization.status === "forbidden") {
    return jsonError(403, "Only the project owner can remove collaborators.");
  }

  const { count } = await removeCollaborator(projectId, collaboratorId);

  if (count === 0) {
    return jsonError(404, "Collaborator not found.");
  }

  return new Response(null, { status: 204 });
}
