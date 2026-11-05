import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EditorShell } from "@/components/editor/editor-shell";
import { getAuthenticatedViewer } from "@/lib/project-access";
import { listProjectsForOwner, listSharedProjects } from "@/lib/project-store";

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorFrameFallback />}>
      <EditorProjects />
    </Suspense>
  );
}

/**
 * Reading the session is request-time work, so it lives behind the page's
 * Suspense boundary. The frame prerenders and the project lists stream in.
 */
async function EditorProjects() {
  await auth.protect();

  const viewer = await getAuthenticatedViewer();

  if (!viewer) {
    notFound();
  }

  const [ownedProjects, sharedProjects] = await Promise.all([
    listProjectsForOwner(viewer.userId),
    listSharedProjects(viewer),
  ]);

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}

function EditorFrameFallback() {
  return (
    <div className="flex min-h-svh flex-col bg-base" aria-busy="true">
      <div className="h-14 shrink-0 border-b border-surface-border bg-surface" />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-copy-muted">Loading projects…</p>
      </div>
    </div>
  );
}
