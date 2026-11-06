import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";
import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { authorizeProjectAccess } from "@/lib/project-access";
import { listProjectsForOwner, listSharedProjects } from "@/lib/project-store";

interface ProjectWorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <ProjectWorkspace params={params} />
    </Suspense>
  );
}

/**
 * The session read, access check and project lookups are request-time work, so
 * they live behind the page's Suspense boundary instead of blocking the
 * prerendered shell.
 */
async function ProjectWorkspace({ params }: ProjectWorkspacePageProps) {
  await auth.protect();

  const { projectId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    redirect(SIGN_IN_PATH);
  }

  if (access.status === "denied") {
    return <AccessDenied />;
  }

  const [ownedProjects, sharedProjects] = await Promise.all([
    listProjectsForOwner(access.viewer.userId),
    listSharedProjects(access.viewer),
  ]);

  return (
    <WorkspaceShell
      project={access.project}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      isOwner={access.role === "owner"}
    />
  );
}

function WorkspaceFallback() {
  return (
    <div className="flex min-h-svh flex-col bg-base" aria-busy="true">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-surface-border bg-surface px-3">
        <div className="size-8 rounded-lg bg-surface-2" />
        <div className="h-3 w-40 rounded bg-surface-2" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-copy-muted">Loading workspace…</p>
      </div>
    </div>
  );
}
