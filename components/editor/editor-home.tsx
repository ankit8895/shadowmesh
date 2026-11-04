"use client";

import { PlusIcon } from "lucide-animated";

import { Button } from "@/components/matos-ui/button";

export interface EditorHomeProps {
  onCreateProject: () => void;
}

export function EditorHome({ onCreateProject }: EditorHomeProps) {
  return (
    <div
      data-slot="editor-home"
      className="flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="text-sm leading-relaxed text-copy-muted">
        Start a new architecture workspace, or choose a project from the
        sidebar.
      </p>
      <Button type="button" className="mt-2" onClick={onCreateProject}>
        <PlusIcon size={16} aria-hidden="true" />
        New Project
      </Button>
    </div>
  );
}
