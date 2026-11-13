"use client";

import { useCallback, useEffect, useState } from "react";

import { readErrorMessage, UNEXPECTED_ERROR } from "@/lib/api-error";

/** Metadata for one generated spec; the content is fetched only for preview. */
export interface ProjectSpecSummary {
  id: string;
  /** ISO creation timestamp of the generation. */
  createdAt: string;
  /** Attachment name the download route sends. */
  filename: string;
}

export interface ProjectSpecsState {
  specs: ProjectSpecSummary[];
  /** False until the first request settles, so empty states do not flash. */
  hasLoaded: boolean;
  error: string | null;
  reload: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Response data is rebuilt from validated fields, so a malformed entry is
 * dropped instead of reaching the list.
 */
function parseSpecList(value: unknown): ProjectSpecSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.createdAt !== "string" ||
      typeof entry.filename !== "string"
    ) {
      return [];
    }

    return [{ id: entry.id, createdAt: entry.createdAt, filename: entry.filename }];
  });
}

/**
 * Owns the specs tab's metadata list. It is fetched when the tab mounts, so
 * opening a workspace never asks for specs the user has not looked at, and the
 * Markdown itself is never fetched here.
 */
export function useProjectSpecs(projectId: string): ProjectSpecsState {
  const [specs, setSpecs] = useState<ProjectSpecSummary[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(() => {
    // The request restarts from the effect; only the visible loading state is
    // set here, where an event handler may update state directly.
    setHasLoaded(false);
    setError(null);
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/specs`,
        );

        if (!response.ok) {
          if (!cancelled) {
            setError(await readErrorMessage(response));
          }
          return;
        }

        const body: unknown = await response.json();

        if (!cancelled) {
          setSpecs(parseSpecList(isRecord(body) ? body.specs : null));
        }
      } catch {
        if (!cancelled) {
          setError(UNEXPECTED_ERROR);
        }
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadCount]);

  return { specs, hasLoaded, error, reload };
}
