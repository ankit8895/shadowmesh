"use client";

import { DeleteIcon, FolderOpenIcon, SquarePenIcon } from "lucide-animated";

import { Button } from "@/components/matos-ui/button";
import type { Project } from "@/lib/mock-projects";

export interface ProjectListProps {
  projects: Project[];
  emptyTitle: string;
  emptyDescription: string;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

interface ProjectListEmptyStateProps {
  title: string;
  description: string;
}

function ProjectListEmptyState({
  title,
  description,
}: ProjectListEmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
      <FolderOpenIcon size={32} className="text-copy-faint" aria-hidden="true" />
      <p className="text-sm font-medium text-copy-secondary">{title}</p>
      <p className="max-w-56 text-xs leading-relaxed text-copy-muted">
        {description}
      </p>
    </div>
  );
}

export function ProjectList({
  projects,
  emptyTitle,
  emptyDescription,
  onRename,
  onDelete,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <ProjectListEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul data-slot="project-list" className="flex flex-col gap-0.5">
      {projects.map((project) => {
        // Actions are only available for projects this user owns.
        const canManage = project.isOwner && Boolean(onRename && onDelete);

        return (
          <li
            key={project.id}
            data-slot="project-item"
            className="flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors hover:bg-subtle/70"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-copy-primary">
                {project.name}
              </p>
              <p className="truncate text-xs text-copy-muted">{project.slug}</p>
            </div>

            {canManage ? (
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Rename ${project.name}`}
                  onClick={() => onRename?.(project)}
                >
                  <SquarePenIcon size={14} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${project.name}`}
                  className="text-copy-muted hover:text-error"
                  onClick={() => onDelete?.(project)}
                >
                  <DeleteIcon size={14} aria-hidden="true" />
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
