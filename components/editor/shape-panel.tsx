"use client";

import type { DragEvent } from "react";

import { Button } from "@/components/matos-ui/button";
import { createShapeDragPayload, SHAPE_DRAG_MIME } from "@/lib/canvas-drag";
import { NODE_SHAPES, type CanvasShape } from "@/types/canvas";

const SHAPE_LABELS: Record<CanvasShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
};

function handleDragStart(
  event: DragEvent<HTMLButtonElement>,
  shape: CanvasShape,
) {
  const payload = createShapeDragPayload(shape);

  event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
}

/** Floating toolbar of draggable shapes. Dropping one adds a canvas node. */
export function ShapePanel() {
  return (
    <div
      data-slot="shape-panel"
      aria-label="Shapes"
      role="toolbar"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-surface-5 backdrop-blur-xl"
    >
      {NODE_SHAPES.map((shape) => (
        <Button
          key={shape}
          type="button"
          variant="ghost"
          size="icon"
          draggable
          aria-label={`Drag ${SHAPE_LABELS[shape]} onto the canvas`}
          title={SHAPE_LABELS[shape]}
          className="cursor-grab text-copy-muted hover:text-copy-primary active:cursor-grabbing"
          onDragStart={(event) => handleDragStart(event, shape)}
        >
          <ShapeGlyph shape={shape} />
        </Button>
      ))}
    </div>
  );
}

/** Small outline glyphs; lucide-animated ships no shape icons. */
function ShapeGlyph({ shape }: { shape: CanvasShape }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden="true"
      className="shrink-0"
    >
      {shape === "rectangle" ? (
        <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
      ) : null}
      {shape === "circle" ? <circle cx="8" cy="8" r="6" /> : null}
      {shape === "pill" ? (
        <rect x="1" y="5" width="14" height="6" rx="3" />
      ) : null}
      {shape === "diamond" ? <path d="M8 1.5 14.5 8 8 14.5 1.5 8Z" /> : null}
      {shape === "hexagon" ? <path d="M4.5 2h7L15 8l-3.5 6h-7L1 8Z" /> : null}
      {shape === "cylinder" ? (
        <>
          <ellipse cx="8" cy="4" rx="5.5" ry="2.2" />
          <path d="M2.5 4v8c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V4" />
        </>
      ) : null}
    </svg>
  );
}
