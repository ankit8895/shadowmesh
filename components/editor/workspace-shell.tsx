"use client";

import {
  CloudUploadIcon,
  LayoutGridIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-animated";
import { useRef, useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasRoom } from "@/components/editor/canvas-room";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceUserMenu } from "@/components/editor/presence-avatars";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { ShareProjectDialog } from "@/components/editor/share-project-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/matos-ui/button";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
import type { ProjectSummary } from "@/lib/project-types";
import { cn } from "@/lib/utils";

export interface WorkspaceShellProps {
  project: ProjectSummary;
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
  /** Only owners can invite, remove or manage access in the share dialog. */
  isOwner: boolean;
}

/**
 * Full-viewport workspace for a single project: navbar, project sidebar,
 * collaborative canvas and AI workspace sidebar. The canvas opens the
 * project's Liveblocks room, and the AI sidebar renders inside that room so it
 * can read the shared AI status feed.
 */
export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
  isOwner,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  // Feed reads are lazy: the room's chat and status feeds are only requested
  // once the AI workspace has been opened.
  const [hasOpenedAiSidebar, setHasOpenedAiSidebar] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(
    null,
  );
  const [canvasSaveStatus, setCanvasSaveStatus] =
    useState<CanvasSaveStatus>("idle");
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const saveCanvasRef = useRef<(() => Promise<void>) | null>(null);
  const canvasSnapshotRef = useRef<(() => CanvasSnapshot) | null>(null);
  const actions = useProjectActions({ activeProjectId: project.id });

  const saveLabel =
    canvasSaveStatus === "saving"
      ? "Saving…"
      : canvasSaveStatus === "pending"
        ? "Unsaved"
        : canvasSaveStatus === "saved"
          ? "Saved"
          : canvasSaveStatus === "error"
            ? "Save failed"
            : "Save";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) actions.closeDialog();
  };

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        title={project.name}
        showUserButton={false}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              disabled={!isCanvasReady || canvasSaveStatus === "saving"}
              onClick={() => void saveCanvasRef.current?.()}
            >
              <CloudUploadIcon size={16} aria-hidden="true" />
              <span
                aria-live="polite"
                className={cn(
                  canvasSaveStatus === "saved" && "text-success",
                  canvasSaveStatus === "error" && "text-error",
                )}
              >
                {saveLabel}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsTemplatesOpen(true)}
            >
              <LayoutGridIcon size={16} aria-hidden="true" />
              Templates
            </Button>
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
              onClick={() => {
                setIsAiSidebarOpen((isOpen) => !isOpen);
                setHasOpenedAiSidebar(true);
              }}
            >
              <SparklesIcon size={20} aria-hidden="true" />
            </Button>
          </>
        }
      />

      <main
        data-slot="workspace-main"
        data-ai-open={isAiSidebarOpen}
        className="group relative min-h-0 flex-1 overflow-hidden bg-base"
      >
        <CanvasRoom
          roomId={project.id}
          template={pendingTemplate}
          onTemplateImported={() => setPendingTemplate(null)}
          onSaveStatusChange={setCanvasSaveStatus}
          onReadyChange={setIsCanvasReady}
          saveCanvasRef={saveCanvasRef}
          canvasSnapshotRef={canvasSnapshotRef}
          aiSidebar={
            <AiSidebar
              isOpen={isAiSidebarOpen}
              projectId={project.id}
              canvasSnapshotRef={canvasSnapshotRef}
              feedsEnabled={hasOpenedAiSidebar}
              onClose={() => setIsAiSidebarOpen(false)}
            />
          }
        />

        {/* The canvas owns the account menu once it loads; until then this
            fallback keeps it reachable during connecting and error states. */}
        {isCanvasReady ? null : (
          <div className="pointer-events-none absolute top-4 right-4 z-20">
            <div className="pointer-events-auto">
              <WorkspaceUserMenu />
            </div>
          </div>
        )}
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

      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={setPendingTemplate}
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
