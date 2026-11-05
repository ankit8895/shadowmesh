import { Prisma } from "@/app/generated/prisma/client";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUserId } from "@/lib/project-access";
import { parseCreateProjectInput } from "@/lib/project-input";
import { createProject, listProjectsForOwner } from "@/lib/project-store";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError(401, "Unauthorized.");
  }

  const projects = await listProjectsForOwner(userId);

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError(401, "Unauthorized.");
  }

  const input = await parseCreateProjectInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  try {
    const project = await createProject(userId, input.data);

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    // The room ID doubles as the primary key, so a collision is a conflict
    // rather than a server error.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(409, "That room ID is already in use.");
    }

    throw error;
  }
}
