"use client";

import { DownloadIcon } from "lucide-animated";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/matos-ui/button";
import {
  StackedDialog,
  StackedDialogClose,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogFooter,
  StackedDialogHeader,
  StackedDialogTitle,
} from "@/components/matos-ui/stacked-dialog";
import { SpecMarkdown } from "@/components/editor/spec-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectSpecSummary } from "@/hooks/use-project-specs";
import { readErrorMessage, UNEXPECTED_ERROR } from "@/lib/api-error";
import { formatSpecTimestamp, specDownloadUrl } from "@/lib/spec-file";
import { cn } from "@/lib/utils";

export interface SpecPreviewDialogProps {
  projectId: string;
  /** The spec being previewed; `null` keeps the dialog closed. */
  spec: ProjectSpecSummary | null;
  onOpenChange: (open: boolean) => void;
}

/** The fetch result for one spec; anything for another spec reads as loading. */
interface SpecPreviewState {
  specId: string;
  content: string | null;
  error: string | null;
}

/**
 * Previews one spec. The Markdown is fetched through the access-checked
 * download route (never from Blob directly) and kept only while the dialog is
 * open. Escape, the backdrop and the close actions are handled by the dialog.
 */
export function SpecPreviewDialog({
  projectId,
  spec,
  onOpenChange,
}: SpecPreviewDialogProps) {
  const [preview, setPreview] = useState<SpecPreviewState | null>(null);

  useEffect(() => {
    if (!spec) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        // `fetch` ignores the attachment header, so the same access-checked
        // endpoint that serves the download also serves the preview text.
        const response = await fetch(specDownloadUrl(projectId, spec.id));

        if (!response.ok) {
          const message = await readErrorMessage(response);

          if (!cancelled) {
            setPreview({ specId: spec.id, content: null, error: message });
          }
          return;
        }

        const markdown = await response.text();

        if (!cancelled) {
          setPreview({ specId: spec.id, content: markdown, error: null });
        }
      } catch {
        if (!cancelled) {
          setPreview({ specId: spec.id, content: null, error: UNEXPECTED_ERROR });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, spec]);

  // The dialog holds the spec content only while it is open.
  function handleOpenChange(open: boolean) {
    if (!open) {
      setPreview(null);
    }

    onOpenChange(open);
  }

  const result = spec && preview?.specId === spec.id ? preview : null;
  const isLoading = spec !== null && result === null;

  return (
    <StackedDialog open={spec !== null} onOpenChange={handleOpenChange}>
      <StackedDialogContent className="max-w-2xl">
        <StackedDialogHeader>
          <StackedDialogTitle className="truncate">
            {spec?.filename ?? "Spec"}
          </StackedDialogTitle>
          <StackedDialogDescription>
            {spec ? `Generated ${formatSpecTimestamp(spec.createdAt)}` : null}
          </StackedDialogDescription>
        </StackedDialogHeader>

        <ScrollArea className="mt-3 h-[min(60vh,32rem)] rounded-xl border border-surface-border bg-surface px-4 py-3">
          {isLoading ? (
            <p className="py-2 text-xs text-copy-muted">Loading spec…</p>
          ) : result?.error ? (
            <p role="alert" className="py-2 text-xs leading-relaxed text-error">
              {result.error}
            </p>
          ) : result?.content ? (
            <SpecMarkdown markdown={result.content} />
          ) : null}
        </ScrollArea>

        <StackedDialogFooter>
          <StackedDialogClose render={<Button variant="secondary">Close</Button>} />
          {spec ? (
            <a
              href={specDownloadUrl(projectId, spec.id)}
              download={spec.filename}
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "gap-1.5",
              )}
            >
              <DownloadIcon size={16} aria-hidden="true" />
              Download
            </a>
          ) : null}
        </StackedDialogFooter>
      </StackedDialogContent>
    </StackedDialog>
  );
}
