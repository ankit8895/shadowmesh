"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { ProjectSummary } from "@/lib/project-types";
import { toProjectSlug } from "@/lib/project-slug";

export type ProjectDialogKind = "create" | "rename" | "delete";

const ROOM_SUFFIX_LENGTH = 6;
const UNEXPECTED_ERROR = "Something went wrong. Please try again.";

/** Six random base-36 characters, e.g. `k3f9q2`. */
function createRoomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));

  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, ROOM_SUFFIX_LENGTH);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  } catch {
    // Non-JSON error body — fall through to the generic message.
  }

  return UNEXPECTED_ERROR;
}

export interface UseProjectActionsOptions {
  /**
   * The workspace currently open. Delete redirects to `/editor` when it removes
   * this project and refreshes in place otherwise.
   */
  activeProjectId?: string | null;
}

export interface ProjectActions {
  openDialog: ProjectDialogKind | null;
  activeProject: ProjectSummary | null;
  name: string;
  roomId: string;
  isSubmitting: boolean;
  error: string | null;
  openCreate: () => void;
  openRename: (project: ProjectSummary) => void;
  openDelete: (project: ProjectSummary) => void;
  closeDialog: () => void;
  setName: (name: string) => void;
  submit: () => Promise<void>;
}

/**
 * Owns the project dialogs and their mutations. Each submit calls the project
 * API and then refreshes the server-rendered project lists, so no project data
 * is cached in client state. Dialog values survive closing so the dialogs can
 * animate out with their content intact; opening a dialog resets them.
 */
export function useProjectActions({
  activeProjectId,
}: UseProjectActionsOptions = {}): ProjectActions {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<ProjectDialogKind | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectSummary | null>(
    null,
  );
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => toProjectSlug(name), [name]);
  // The project ID is the Liveblocks room ID, so the preview in the create
  // dialog is exactly the ID the project is created with.
  const roomId = useMemo(
    () => (suffix ? `${slug || "project"}-${suffix}` : ""),
    [slug, suffix],
  );

  const closeDialog = useCallback(() => {
    setOpenDialog(null);
    setIsSubmitting(false);
    setError(null);
  }, []);

  const openCreate = useCallback(() => {
    setActiveProject(null);
    setName("");
    setSuffix(createRoomSuffix());
    setIsSubmitting(false);
    setError(null);
    setOpenDialog("create");
  }, []);

  const openRename = useCallback((project: ProjectSummary) => {
    setActiveProject(project);
    setName(project.name);
    setIsSubmitting(false);
    setError(null);
    setOpenDialog("rename");
  }, []);

  const openDelete = useCallback((project: ProjectSummary) => {
    setActiveProject(project);
    setName(project.name);
    setIsSubmitting(false);
    setError(null);
    setOpenDialog("delete");
  }, []);

  const submit = useCallback(async () => {
    if (!openDialog || isSubmitting) return;

    const trimmedName = name.trim();

    // A symbols-only name slugifies to an empty string, so it never reaches a
    // project record even if a dialog's own validation is bypassed.
    if (openDialog !== "delete" && (!trimmedName || !slug)) return;
    if (openDialog !== "create" && !activeProject) return;

    const failWith = async (response: Response) => {
      setError(await readErrorMessage(response));
      setIsSubmitting(false);
    };

    setIsSubmitting(true);
    setError(null);

    try {
      if (openDialog === "create") {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName, roomId }),
        });

        if (!response.ok) {
          await failWith(response);
          return;
        }

        const { project } = (await response.json()) as {
          project: ProjectSummary;
        };

        setOpenDialog(null);
        setIsSubmitting(false);
        router.push(`/editor/${project.id}`);
        return;
      }

      if (!activeProject) return;

      if (openDialog === "rename") {
        const response = await fetch(`/api/projects/${activeProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (!response.ok) {
          await failWith(response);
          return;
        }

        setOpenDialog(null);
        setIsSubmitting(false);
        router.refresh();
        return;
      }

      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        await failWith(response);
        return;
      }

      const deletedId = activeProject.id;

      setOpenDialog(null);
      setIsSubmitting(false);

      if (deletedId === activeProjectId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch {
      setError(UNEXPECTED_ERROR);
      setIsSubmitting(false);
    }
  }, [activeProject, activeProjectId, isSubmitting, name, openDialog, roomId, router, slug]);

  return {
    openDialog,
    activeProject,
    name,
    roomId,
    isSubmitting,
    error,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setName,
    submit,
  };
}
