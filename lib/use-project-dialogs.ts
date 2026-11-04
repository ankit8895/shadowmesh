"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type Project } from "@/lib/mock-projects";
import { toProjectSlug } from "@/lib/project-slug";

// Mock submissions resolve on a short timer so the dialogs can exercise their
// loading state without an API. Everything stays in local state.
const SUBMIT_DELAY_MS = 250;

export type ProjectDialogKind = "create" | "rename" | "delete";

export interface ProjectDialogs {
  projects: Project[];
  openDialog: ProjectDialogKind | null;
  activeProject: Project | null;
  name: string;
  slug: string;
  isSubmitting: boolean;
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
  closeDialog: () => void;
  setName: (name: string) => void;
  submit: () => void;
}

/**
 * Single owner of the project dialogs: which dialog is open, the form value,
 * the active project, and the submit state. Dialog values are kept after close
 * so the dialogs can animate out with their content intact; opening a dialog
 * resets them.
 */
export function useProjectDialogs(
  initialProjects: Project[],
): ProjectDialogs {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openDialog, setOpenDialog] = useState<ProjectDialogKind | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  const clearPendingSubmit = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, []);

  const closeDialog = useCallback(() => {
    clearPendingSubmit();
    setOpenDialog(null);
    setIsSubmitting(false);
  }, [clearPendingSubmit]);

  const openCreate = useCallback(() => {
    clearPendingSubmit();
    setActiveProject(null);
    setName("");
    setIsSubmitting(false);
    setOpenDialog("create");
  }, [clearPendingSubmit]);

  const openRename = useCallback(
    (project: Project) => {
      clearPendingSubmit();
      setActiveProject(project);
      setName(project.name);
      setIsSubmitting(false);
      setOpenDialog("rename");
    },
    [clearPendingSubmit],
  );

  const openDelete = useCallback(
    (project: Project) => {
      clearPendingSubmit();
      setActiveProject(project);
      setName(project.name);
      setIsSubmitting(false);
      setOpenDialog("delete");
    },
    [clearPendingSubmit],
  );

  const slug = useMemo(() => toProjectSlug(name), [name]);

  const submit = useCallback(() => {
    if (!openDialog || isSubmitting) return;

    const trimmedName = name.trim();
    // Symbols-only names slugify to an empty string, so they never reach a
    // project record even if a caller skips the dialog's own validation.
    if (openDialog !== "delete" && (!trimmedName || !toProjectSlug(trimmedName)))
      return;

    setIsSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => {
      submitTimeoutRef.current = null;

      if (openDialog === "create") {
        setProjects((current) => [
          ...current,
          {
            id: `project-${Date.now()}`,
            name: trimmedName,
            slug: toProjectSlug(trimmedName),
            isOwner: true,
          },
        ]);
      } else if (openDialog === "rename" && activeProject) {
        setProjects((current) =>
          current.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  name: trimmedName,
                  slug: toProjectSlug(trimmedName),
                }
              : project,
          ),
        );
      } else if (openDialog === "delete" && activeProject) {
        setProjects((current) =>
          current.filter((project) => project.id !== activeProject.id),
        );
      }

      closeDialog();
    }, SUBMIT_DELAY_MS);
  }, [activeProject, closeDialog, isSubmitting, name, openDialog]);

  return {
    projects,
    openDialog,
    activeProject,
    name,
    slug,
    isSubmitting,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setName,
    submit,
  };
}
