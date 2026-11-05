import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAuthenticatedViewer } from "@/lib/project-access";
import { findProjectForViewer } from "@/lib/project-store";

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
 * The session read and the project lookup are request-time work, so they live
 * behind the page's Suspense boundary instead of blocking the prerendered shell.
 */
async function ProjectWorkspace({ params }: ProjectWorkspacePageProps) {
  await auth.protect();

  const { projectId } = await params;
  const viewer = await getAuthenticatedViewer();

  if (!viewer) {
    notFound();
  }

  const project = await findProjectForViewer(projectId, viewer);

  if (!project) {
    notFound();
  }

  return (
    <main className="flex min-h-svh flex-col bg-base">
      <WorkspaceHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">
          {project.name}
        </h1>
        <p className="text-sm text-copy-muted">Room {project.id}</p>
      </div>
    </main>
  );
}

function WorkspaceHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-surface-border px-4">
      <Link
        href="/editor"
        className="text-sm text-copy-muted transition-colors hover:text-copy-primary"
      >
        All projects
      </Link>
    </header>
  );
}

function WorkspaceFallback() {
  return (
    <main className="flex min-h-svh flex-col bg-base" aria-busy="true">
      <WorkspaceHeader />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-copy-muted">Loading project…</p>
      </div>
    </main>
  );
}
