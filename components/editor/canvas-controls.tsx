"use client";

import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";
import { useReactFlow } from "@xyflow/react";
import {
  MaximizeIcon,
  RedoIcon,
  UndoIcon,
} from "lucide-animated";

import { Button } from "@/components/matos-ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const ZOOM_DURATION = 200;

/**
 * Floating canvas controls: zoom out / fit view / zoom in, then undo / redo.
 * Zoom actions use the React Flow instance; history actions use Liveblocks'
 * per-client history. The same handlers back the keyboard shortcuts.
 */
export function CanvasControls() {
  const reactFlow = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ reactFlow, undo, redo });

  return (
    <div
      data-slot="canvas-controls"
      role="toolbar"
      aria-label="Canvas controls"
      className="absolute bottom-24 left-6 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-surface-5 backdrop-blur-xl"
    >
      <div role="group" aria-label="Zoom" className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          title="Zoom out (-)"
          className="text-copy-muted hover:text-copy-primary"
          onClick={() => void reactFlow.zoomOut({ duration: ZOOM_DURATION })}
        >
          <ZoomOutGlyph />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Fit view"
          title="Fit view"
          className="text-copy-muted hover:text-copy-primary"
          onClick={() =>
            void reactFlow.fitView({ duration: ZOOM_DURATION, padding: 0.2 })
          }
        >
          <MaximizeIcon size={16} aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          title="Zoom in (+)"
          className="text-copy-muted hover:text-copy-primary"
          onClick={() => void reactFlow.zoomIn({ duration: ZOOM_DURATION })}
        >
          <ZoomInGlyph />
        </Button>
      </div>

      <span
        aria-hidden="true"
        className="mx-0.5 h-5 w-px bg-surface-border"
      />

      <div
        role="group"
        aria-label="History"
        className="flex items-center gap-0.5"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          title="Undo (Ctrl/Cmd+Z)"
          className="text-copy-muted hover:text-copy-primary"
          disabled={!canUndo}
          onClick={undo}
        >
          <UndoIcon size={16} aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          title="Redo (Ctrl/Cmd+Shift+Z)"
          className="text-copy-muted hover:text-copy-primary"
          disabled={!canRedo}
          onClick={redo}
        >
          <RedoIcon size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/** lucide-animated ships no plain minus / zoom glyphs. */
function ZoomOutGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3.5 8h9" />
    </svg>
  );
}

function ZoomInGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3.5 8h9" />
      <path d="M8 3.5v9" />
    </svg>
  );
}
