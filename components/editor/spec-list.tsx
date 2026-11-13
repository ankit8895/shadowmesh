"use client";

import { DownloadIcon, FileTextIcon } from "lucide-animated";

import { Button, buttonVariants } from "@/components/matos-ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectSpecSummary } from "@/hooks/use-project-specs";
import { formatSpecTimestamp, specDownloadUrl } from "@/lib/spec-file";
import { cn } from "@/lib/utils";

export interface SpecListProps {
  projectId: string;
  specs: ProjectSpecSummary[];
  /** False until the first request settles, so empty states do not flash. */
  hasLoaded: boolean;
  error: string | null;
  onSelect: (spec: ProjectSpecSummary) => void;
  onRetry: () => void;
}

/**
 * Compact, scrollable list of the project's generated specs. Selecting a row
 * opens the preview; the download anchor lets the browser save the file from
 * the access-checked endpoint. A failed refresh keeps the rows already on
 * screen and reports the problem above them.
 */
export function SpecList({
  projectId,
  specs,
  hasLoaded,
  error,
  onSelect,
  onRetry,
}: SpecListProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-2">
        {!hasLoaded ? (
          <p className="px-1 py-2 text-xs text-copy-muted">Loading specs…</p>
        ) : (
          <>
            {error ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-surface-border bg-elevated px-3 py-3">
                <p role="alert" className="text-xs leading-relaxed text-error">
                  {error}
                </p>
                {specs.length === 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                ) : null}
              </div>
            ) : null}

            {specs.length === 0 ? (
              error ? null : (
                <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-ai-text">
                    <FileTextIcon size={20} aria-hidden="true" />
                  </span>
                  <p className="text-xs font-medium text-copy-primary">
                    No specs yet
                  </p>
                  <p className="text-[11px] leading-relaxed text-copy-muted">
                    Generate a spec from the current canvas and it will appear
                    here.
                  </p>
                </div>
              )
            ) : (
              specs.map((spec) => (
                <div
                  key={spec.id}
                  data-slot="spec-list-item"
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-elevated p-2 pl-2.5 transition-colors hover:bg-surface-2"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ai-text">
                    <FileTextIcon size={16} aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelect(spec)}
                    aria-label={`Preview ${spec.filename}`}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="w-full truncate text-xs font-medium text-copy-primary">
                      {spec.filename}
                    </span>
                    <time
                      dateTime={spec.createdAt}
                      className="text-[10px] text-copy-muted"
                    >
                      {formatSpecTimestamp(spec.createdAt)}
                    </time>
                  </button>
                  <a
                    href={specDownloadUrl(projectId, spec.id)}
                    download={spec.filename}
                    aria-label={`Download ${spec.filename}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    )}
                  >
                    <DownloadIcon size={16} aria-hidden="true" />
                  </a>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
