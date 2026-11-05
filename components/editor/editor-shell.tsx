"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectSummary } from "@/lib/project-types";

export interface EditorShellProps {
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const actions = useProjectActions();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) actions.closeDialog();
  };

  return (
    <div className="flex min-h-svh flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <main className="relative flex flex-1 items-center justify-center">
        <EditorHome onCreateProject={actions.openCreate} />
      </main>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
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
