import { clerkClient } from "@clerk/nextjs/server";

import type { CollaboratorView } from "@/lib/project-types";
import { prisma } from "@/lib/prisma";

/** Clerk's user list accepts at most 100 email filters per request. */
const MAX_PROFILE_LOOKUPS = 100;

interface CollaboratorRecord {
  id: string;
  email: string;
}

interface ClerkProfile {
  name: string | null;
  imageUrl: string | null;
}

const collaboratorSelect = { id: true, email: true } as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Looks up Clerk users by email so a collaborator can show a display name and
 * avatar. An email without a Clerk account has no profile, and the dialog falls
 * back to showing the address alone.
 */
async function findClerkProfiles(
  emails: string[],
): Promise<Map<string, ClerkProfile>> {
  const profiles = new Map<string, ClerkProfile>();
  const lookups = [...new Set(emails.map(normalizeEmail).filter(Boolean))].slice(
    0,
    MAX_PROFILE_LOOKUPS,
  );

  if (lookups.length === 0) {
    return profiles;
  }

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
      emailAddress: lookups,
      limit: lookups.length,
    });

    for (const user of users) {
      const profile: ClerkProfile = {
        name: user.fullName ?? user.username ?? null,
        imageUrl: user.imageUrl || null,
      };

      // A user can have several addresses; match on any of them, not just the
      // primary, so an invitation to a secondary address still resolves.
      for (const address of user.emailAddresses) {
        profiles.set(normalizeEmail(address.emailAddress), profile);
      }
    }
  } catch (error) {
    // Access management still has to work when Clerk is unreachable or the
    // backend key is missing; rows degrade to email-only. Log rather than hide
    // the failure.
    console.error("Unable to load collaborator profiles from Clerk.", error);
  }

  return profiles;
}

async function toCollaboratorViews(
  records: CollaboratorRecord[],
): Promise<CollaboratorView[]> {
  const profiles = await findClerkProfiles(records.map((record) => record.email));

  return records.map(({ id, email }) => {
    const profile = profiles.get(normalizeEmail(email));

    return {
      id,
      email,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}

/** Everyone invited to the project, oldest invitation first. */
export async function listCollaborators(
  projectId: string,
): Promise<CollaboratorView[]> {
  const records = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: collaboratorSelect,
  });

  return toCollaboratorViews(records);
}

/** Case-insensitive duplicate check for the unique `projectId` / `email` pair. */
export function findCollaboratorByEmail(projectId: string, email: string) {
  return prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email: { equals: normalizeEmail(email), mode: "insensitive" },
    },
    select: { id: true },
  });
}

/** Stores the invitation under its normalized address and returns it enriched. */
export async function inviteCollaborator(
  projectId: string,
  email: string,
): Promise<CollaboratorView> {
  const record = await prisma.projectCollaborator.create({
    data: { projectId, email: normalizeEmail(email) },
    select: collaboratorSelect,
  });

  const views = await toCollaboratorViews([record]);

  return views[0];
}

/**
 * Deletes a collaborator scoped to its project, so an ID from another project
 * cannot be removed through this route.
 */
export function removeCollaborator(projectId: string, collaboratorId: string) {
  return prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });
}
