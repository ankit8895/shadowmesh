"use client";

import { useCallback, useState } from "react";

import { readErrorMessage, UNEXPECTED_ERROR } from "@/lib/api-error";
import type { CollaboratorView } from "@/lib/project-types";

export interface CollaboratorsState {
  collaborators: CollaboratorView[];
  /** False until the first list request settles, so empty states do not flash. */
  hasLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  isInviting: boolean;
  /** ID of the collaborator currently being removed, if any. */
  removingId: string | null;
  load: () => Promise<void>;
  invite: (email: string) => Promise<boolean>;
  remove: (collaboratorId: string) => Promise<void>;
}

/**
 * Owns the share dialog's collaborator list and mutations. The list is fetched
 * only when the dialog opens, so opening a workspace never pays for the Clerk
 * profile lookup. Invite and remove update the local list from the API result;
 * the server remains the authority for role checks.
 */
export function useCollaborators(projectId: string): CollaboratorsState {
  const [collaborators, setCollaborators] = useState<CollaboratorView[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      const body = (await response.json()) as {
        collaborators: CollaboratorView[];
      };

      setCollaborators(body.collaborators);
    } catch {
      setError(UNEXPECTED_ERROR);
    } finally {
      setHasLoaded(true);
      setIsLoading(false);
    }
  }, [projectId]);

  const invite = useCallback(
    async (email: string): Promise<boolean> => {
      setIsInviting(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          },
        );

        if (!response.ok) {
          setError(await readErrorMessage(response));
          return false;
        }

        const { collaborator } = (await response.json()) as {
          collaborator: CollaboratorView;
        };

        setCollaborators((current) =>
          current.some((entry) => entry.id === collaborator.id)
            ? current
            : [...current, collaborator],
        );

        return true;
      } catch {
        setError(UNEXPECTED_ERROR);
        return false;
      } finally {
        setIsInviting(false);
      }
    },
    [projectId],
  );

  const remove = useCallback(
    async (collaboratorId: string) => {
      setRemovingId(collaboratorId);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          setError(await readErrorMessage(response));
          return;
        }

        setCollaborators((current) =>
          current.filter((entry) => entry.id !== collaboratorId),
        );
      } catch {
        setError(UNEXPECTED_ERROR);
      } finally {
        setRemovingId(null);
      }
    },
    [projectId],
  );

  return {
    collaborators,
    hasLoaded,
    isLoading,
    error,
    isInviting,
    removingId,
    load,
    invite,
    remove,
  };
}
