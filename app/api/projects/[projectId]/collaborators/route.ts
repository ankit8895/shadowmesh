import { Prisma } from "@/app/generated/prisma/client";
import { jsonError } from "@/lib/api-response";
import {
  findCollaboratorByEmail,
  inviteCollaborator,
  listCollaborators,
} from "@/lib/collaborators";
import {
  authorizeProjectAccess,
  authorizeProjectOwner,
  getAuthenticatedViewer,
} from "@/lib/project-access";
import { parseInviteCollaboratorInput } from "@/lib/project-input";

interface CollaboratorsRouteContext {
  params: Promise<{ projectId: string }>;
}

/** Owners and collaborators can read the list; nobody else can see the project. */
export async function GET(
  _request: Request,
  { params }: CollaboratorsRouteContext,
) {
  const { projectId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "Unauthorized.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  const collaborators = await listCollaborators(projectId);

  return Response.json({ collaborators });
}

export async function POST(
  request: Request,
  { params }: CollaboratorsRouteContext,
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
    return jsonError(403, "Only the project owner can invite collaborators.");
  }

  const input = await parseInviteCollaboratorInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const viewer = await getAuthenticatedViewer();
  const ownerEmail = viewer?.email?.trim().toLowerCase();

  if (ownerEmail && ownerEmail === input.data.email) {
    return jsonError(400, "You already have access to this project.");
  }

  const existing = await findCollaboratorByEmail(projectId, input.data.email);

  if (existing) {
    return jsonError(409, "That email is already a collaborator.");
  }

  try {
    const collaborator = await inviteCollaborator(projectId, input.data.email);

    return Response.json({ collaborator }, { status: 201 });
  } catch (error) {
    // Two invites for the same address can race past the check above; the
    // unique constraint still turns the loser into a conflict.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(409, "That email is already a collaborator.");
    }

    throw error;
  }
}
