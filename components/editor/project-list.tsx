"use client";

import { DeleteIcon, FolderOpenIcon, SquarePenIcon } from "lucide-animated";
import Link from "next/link";

import { Button } from "@/components/matos-ui/button";
import type { ProjectSummary } from "@/lib/project-types";
import { cn } from "@/lib/utils";

export interface ProjectListProps {
  projects: ProjectSummary[];
  emptyTitle: string;
  emptyDescription: string;
  /** The workspace currently open, highlighted in the list. */
  activeProjectId?: string | null;
  onRename?: (project: ProjectSummary) => void;
  onDelete?: (project: ProjectSummary) => void;
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
  activeProjectId,
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
        // Only owned projects are given handlers; shared projects stay read-only.
        const canManage = Boolean(onRename && onDelete);
        const isActive = project.id === activeProjectId;

        return (
          <li
            key={project.id}
            data-slot="project-item"
            data-active={isActive || undefined}
            className={cn(
              "relative flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors",
              isActive ? "bg-accent-dim" : "hover:bg-subtle/70",
            )}
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  isActive ? "text-brand" : "text-copy-primary",
                )}
              >
                {/* The link stretches over the whole row through its ::after
                    layer, so the row padding opens the project too. Row
                    actions sit above that layer. */}
                <Link
                  href={`/editor/${project.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className="rounded-sm after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand"
                >
                  {project.name}
                </Link>
              </p>
              <p className="truncate text-xs text-copy-muted">{project.id}</p>
            </div>

            {canManage ? (
              <div className="relative z-10 flex shrink-0 items-center">
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
