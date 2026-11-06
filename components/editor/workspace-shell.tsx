"use client";

import { SparklesIcon, UsersIcon } from "lucide-animated";
import { useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { ShareProjectDialog } from "@/components/editor/share-project-dialog";
import { Button } from "@/components/matos-ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectSummary } from "@/lib/project-types";

export interface WorkspaceShellProps {
  project: ProjectSummary;
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
  /** Only owners can invite, remove or manage access in the share dialog. */
  isOwner: boolean;
}

/**
 * Full-viewport workspace for a single project: navbar, project sidebar,
 * canvas placeholder and AI sidebar. The canvas and AI chat are placeholders
 * until their own features land.
 */
export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
  isOwner,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const actions = useProjectActions({ activeProjectId: project.id });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) actions.closeDialog();
  };

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        title={project.name}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsShareOpen(true)}
            >
              <UsersIcon size={16} aria-hidden="true" />
              Share
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-expanded={isAiSidebarOpen}
              aria-controls="ai-sidebar"
              onClick={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
            >
              <SparklesIcon size={20} aria-hidden="true" />
            </Button>
          </>
        }
      />

      <main
        data-slot="workspace-canvas"
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-base"
      >
        <div className="flex max-w-md flex-col items-center gap-2 px-6 text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-copy-faint uppercase">
            Canvas
          </p>
          <p className="text-sm leading-relaxed text-copy-muted">
            The design canvas for{" "}
            <span className="text-copy-secondary">{project.name}</span> will
            appear here.
          </p>
          <p className="text-xs text-copy-faint">Room {project.id}</p>
        </div>
      </main>

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={project.id}
        onCreateProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />

      <AiSidebar
        isOpen={isAiSidebarOpen}
        onClose={() => setIsAiSidebarOpen(false)}
      />

      <ShareProjectDialog
        open={isShareOpen}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
        onOpenChange={setIsShareOpen}
      />

      <CreateProjectDialog
        open={actions.openDialog === "create"}
        name={actions.name}
        roomId={actions.roomId}
        isSubmitting={actions.isSubmitting}
        error={actions.error}
        onNameChange={actions.setName}
        onOpenChange={handleOpenChange}
        onSubmit={() => void actions.submit()}
      />
      <RenameProjectDialog
        open={actions.openDialog === "rename"}
        projectName={actions.activeProject?.name ?? ""}
        name={actions.name}
        isSubmitting={actions.isSubmitting}
        error={actions.error}
        onNameChange={actions.setName}
        onOpenChange={handleOpenChange}
        onSubmit={() => void actions.submit()}
      />
      <DeleteProjectDialog
        open={actions.openDialog === "delete"}
        projectName={actions.activeProject?.name ?? ""}
        isSubmitting={actions.isSubmitting}
        error={actions.error}
        onOpenChange={handleOpenChange}
        onConfirm={() => void actions.submit()}
      />
    </div>
  );
}
