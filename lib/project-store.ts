import type { AuthenticatedViewer } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

/** The project fields returned by the API. Owner IDs stay server-side. */
const projectSummarySelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function listProjectsForOwner(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: projectSummarySelect,
  });
}

/** Projects the viewer can access through a collaborator invitation. */
export function listSharedProjects(viewer: AuthenticatedViewer) {
  if (!viewer.email) {
    return Promise.resolve([]);
  }

  return prisma.project.findMany({
    where: {
      ownerId: { not: viewer.userId },
      collaborators: {
        some: { email: { equals: viewer.email, mode: "insensitive" } },
      },
    },
    orderBy: { createdAt: "desc" },
    select: projectSummarySelect,
  });
}

/** A project the viewer may open: either owned by them or shared with them. */
export function findProjectForViewer(
  projectId: string,
  viewer: AuthenticatedViewer,
) {
  const collaboratorMatch = viewer.email
    ? {
        collaborators: {
          some: { email: { equals: viewer.email, mode: "insensitive" as const } },
        },
      }
    : null;

  return prisma.project.findFirst({
    where: collaboratorMatch
      ? { id: projectId, OR: [{ ownerId: viewer.userId }, collaboratorMatch] }
      : { id: projectId, ownerId: viewer.userId },
    // The owner ID decides the viewer's role. It is stripped from the returned
    // project before it reaches the page, so it never becomes a client prop.
    select: { ...projectSummarySelect, ownerId: true },
  });
}

export function createProject(
  ownerId: string,
  input: { name: string; description: string | null; roomId: string | null },
) {
  return prisma.project.create({
    data: {
      // A generated room ID becomes the project ID, so the Liveblocks room and
      // the project can never drift apart. Without one the schema's cuid()
      // default applies.
      ...(input.roomId ? { id: input.roomId } : {}),
      ownerId,
      name: input.name,
      description: input.description,
    },
    select: projectSummarySelect,
  });
}

export function renameProject(projectId: string, name: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { name },
    select: projectSummarySelect,
  });
}

export function deleteProject(projectId: string) {
  return prisma.project.delete({
    where: { id: projectId },
    select: { id: true },
  });
}
