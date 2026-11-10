"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react/suspense";

import { cn } from "@/lib/utils";

const MAX_VISIBLE_COLLABORATORS = 5;
const AVATAR_SIZE = 32;

interface CollaboratorAvatarData {
  connectionId: number;
  id: string;
  name: string;
  avatar: string;
  color: string;
}

/**
 * The current user's Clerk menu. Shared by the presence group and by the
 * workspace while the room is still connecting, so the account menu is never
 * unavailable just because the canvas has not loaded yet.
 */
export function WorkspaceUserMenu() {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: {
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
          },
        },
      }}
    />
  );
}

/**
 * Canvas-only participant group: collaborator avatars from Liveblocks presence
 * plus the current user's Clerk menu. The workspace navbar deliberately omits
 * its own `UserButton` so the menu is not shown twice.
 */
export function PresenceAvatars() {
  const { userId } = useAuth();
  const others = useOthers();
  const seenUserIds = new Set<string>();
  const collaborators: CollaboratorAvatarData[] = [];

  for (const other of others) {
    if (!other.id || other.id === userId || seenUserIds.has(other.id)) {
      continue;
    }

    seenUserIds.add(other.id);
    collaborators.push({
      connectionId: other.connectionId,
      id: other.id,
      name: other.info.name.trim() || "Collaborator",
      avatar: other.info.avatar,
      color: other.info.cursorColor || "var(--accent-primary)",
    });
  }

  const visibleCollaborators = collaborators.slice(
    0,
    MAX_VISIBLE_COLLABORATORS,
  );
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div
      data-slot="presence-avatars"
      className={cn(
        "pointer-events-none absolute top-4 right-4 z-20 flex items-center gap-2",
        // Step aside for the open AI sidebar so the account menu stays visible
        // next to it instead of underneath it.
        "lg:group-data-[ai-open=true]:right-[21.5rem]",
      )}
    >
      {collaborators.length > 0 ? (
        <>
          <div
            role="group"
            aria-label={`${collaborators.length} other ${
              collaborators.length === 1 ? "collaborator" : "collaborators"
            } in this room`}
            className="flex items-center -space-x-2"
          >
            {visibleCollaborators.map((collaborator) => (
              <CollaboratorAvatar
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))}

            {overflowCount > 0 ? (
              <span
                title={`${overflowCount} more ${
                  overflowCount === 1 ? "collaborator" : "collaborators"
                }`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-medium text-copy-secondary ring-2 ring-base"
              >
                +{overflowCount}
              </span>
            ) : null}
          </div>

          <span
            aria-hidden="true"
            className="h-6 w-px shrink-0 bg-surface-border"
          />
        </>
      ) : null}

      <div className="pointer-events-auto">
        <WorkspaceUserMenu />
      </div>
    </div>
  );
}

function CollaboratorAvatar({
  collaborator,
}: {
  collaborator: CollaboratorAvatarData;
}) {
  if (collaborator.avatar) {
    return (
      // Clerk serves avatars from its own CDN, which next/image would require
      // configuring as a remote host just for this stack.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={collaborator.avatar}
        alt={collaborator.name}
        title={collaborator.name}
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-8 shrink-0 rounded-full bg-surface-2 object-cover ring-2 ring-base"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={collaborator.name}
      title={collaborator.name}
      style={{
        backgroundColor: collaborator.color,
        color: "var(--bg-base)",
      }}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-base"
    >
      {getInitials(collaborator.name)}
    </span>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";

  return `${first}${last}`.toUpperCase();
}
