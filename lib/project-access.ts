import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface AuthenticatedViewer {
  userId: string;
  email: string | null;
}

export type ProjectAuthorization =
  | { status: "authorized"; userId: string }
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "forbidden" };

/** Returns the Clerk user ID, or `null` for an unauthenticated request. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const { userId } = await auth();

  return userId ?? null;
}

/**
 * Returns the signed-in user's ID and primary email. The email is what matches
 * collaborator invitations, so shared projects are resolved per viewer.
 */
export async function getAuthenticatedViewer(): Promise<AuthenticatedViewer | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;

  return { userId, email };
}

/**
 * Resolves a project and checks that the caller owns it. Ownership is compared
 * against the stored `ownerId`, so a missing project and a project owned by
 * someone else stay distinguishable for the caller.
 */
export async function authorizeProjectOwner(
  projectId: string,
): Promise<ProjectAuthorization> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { status: "unauthenticated" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return { status: "not-found" };
  }

  if (project.ownerId !== userId) {
    return { status: "forbidden" };
  }

  return { status: "authorized", userId };
}
