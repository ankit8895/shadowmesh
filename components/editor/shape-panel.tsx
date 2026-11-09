"use client";

import { useEffect, useState, type DragEvent as ReactDragEvent } from "react";

import { Button } from "@/components/matos-ui/button";
import { NodeShape } from "@/components/editor/node-shape";
import { createShapeDragPayload, SHAPE_DRAG_MIME } from "@/lib/canvas-drag";
import { DEFAULT_NODE_COLOR, NODE_SHAPES, type CanvasShape } from "@/types/canvas";

const SHAPE_LABELS: Record<CanvasShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
};

interface ShapeDragPreview {
  payload: ReturnType<typeof createShapeDragPayload>;
  x: number;
  y: number;
}

/** Floating toolbar of draggable shapes. Dropping one adds a canvas node. */
export function ShapePanel() {
  const [preview, setPreview] = useState<ShapeDragPreview | null>(null);
  const isDragging = preview !== null;

  // The preview follows the cursor for the whole drag, wherever the pointer is,
  // so the listeners live on `window`. `dragend` also fires on drop and on
  // cancel, which covers every way a drag can finish.
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function handleDragOver(event: DragEvent) {
      // Browsers report the drag position as 0,0 once the drag has ended.
      if (event.clientX === 0 && event.clientY === 0) {
        return;
      }

      setPreview((current) =>
        current ? { ...current, x: event.clientX, y: event.clientY } : current,
      );
    }

    function handleDragEnd() {
      setPreview(null);
    }

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDragEnd);
    window.addEventListener("dragend", handleDragEnd);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDragEnd);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, [isDragging]);

  function handleDragStart(
    event: ReactDragEvent<HTMLButtonElement>,
    shape: CanvasShape,
  ) {
    const payload = createShapeDragPayload(shape);

    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copy";

    // The native drag image is the button glyph; the ghost preview replaces it.
    const dragImage = document.createElement("canvas");
    dragImage.width = 1;
    dragImage.height = 1;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    setPreview({ payload, x: event.clientX, y: event.clientY });
  }

  return (
    <>
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

      {preview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 opacity-70"
          style={{
            left: preview.x,
            top: preview.y,
            width: preview.payload.width,
            height: preview.payload.height,
            transform: "translate(-50%, -50%)",
          }}
        >
          <NodeShape
            shape={preview.payload.shape}
            color={DEFAULT_NODE_COLOR.fill}
          />
        </div>
      ) : null}
    </>
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
