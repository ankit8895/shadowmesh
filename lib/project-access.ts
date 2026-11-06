import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { findProjectForViewer } from "@/lib/project-store";
import type { ProjectSummary } from "@/lib/project-types";

export interface AuthenticatedViewer {
  userId: string;
  email: string | null;
  /** Display name from Clerk, falling back to the email or `Anonymous`. */
  name: string;
  avatar: string | null;
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
 * Returns the signed-in user's ID, primary email and Liveblocks profile. The
 * email matches collaborator invitations, so shared projects are resolved per
 * viewer, and the name and avatar are attached to Liveblocks sessions.
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
  const name = user?.fullName?.trim() || user?.username || email || "Anonymous";

  return { userId, email, name, avatar: user?.imageUrl ?? null };
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

export type ProjectRole = "owner" | "collaborator";

export type ProjectAccess =
  | { status: "unauthenticated" }
  | { status: "denied" }
  | {
      status: "authorized";
      viewer: AuthenticatedViewer;
      project: ProjectSummary;
      /** What the viewer may do; the API re-checks ownership on every write. */
      role: ProjectRole;
    };

/**
 * Resolves the viewer and the project for the workspace route. Ownership and
 * collaborator invitations are both accepted; a missing project and a project
 * the viewer cannot open both resolve to `denied`, so room IDs cannot be probed
 * for existence from the page.
 */
export async function authorizeProjectAccess(
  projectId: string,
): Promise<ProjectAccess> {
  const viewer = await getAuthenticatedViewer();

  if (!viewer) {
    return { status: "unauthenticated" };
  }

  const project = await findProjectForViewer(projectId, viewer);

  if (!project) {
    return { status: "denied" };
  }

  const { ownerId, ...summary } = project;

  return {
    status: "authorized",
    viewer,
    project: summary,
    role: ownerId === viewer.userId ? "owner" : "collaborator",
  };
}
