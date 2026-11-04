"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { MOCK_PROJECTS } from "@/lib/mock-projects";
import { useProjectDialogs } from "@/lib/use-project-dialogs";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs(MOCK_PROJECTS);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) dialogs.closeDialog();
  };

  return (
    <div className="flex min-h-svh flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <main className="relative flex flex-1 items-center justify-center">
        <EditorHome onCreateProject={dialogs.openCreate} />
      </main>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={dialogs.projects}
        onCreateProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />
      <CreateProjectDialog
        open={dialogs.openDialog === "create"}
        name={dialogs.name}
        slug={dialogs.slug}
        isSubmitting={dialogs.isSubmitting}
        onNameChange={dialogs.setName}
        onOpenChange={handleOpenChange}
        onSubmit={dialogs.submit}
      />
      <RenameProjectDialog
        open={dialogs.openDialog === "rename"}
        projectName={dialogs.activeProject?.name ?? ""}
        name={dialogs.name}
        slug={dialogs.slug}
        isSubmitting={dialogs.isSubmitting}
        onNameChange={dialogs.setName}
        onOpenChange={handleOpenChange}
        onSubmit={dialogs.submit}
      />
      <DeleteProjectDialog
        open={dialogs.openDialog === "delete"}
        projectName={dialogs.activeProject?.name ?? ""}
        isSubmitting={dialogs.isSubmitting}
        onOpenChange={handleOpenChange}
        onConfirm={dialogs.submit}
      />
    </div>
  );
}
