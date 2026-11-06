"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  type CanvasNode,
} from "@/types/canvas";

const HANDLES = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const;

/**
 * First-pass renderer for `canvasNode`: every shape is a bordered rectangle
 * with the label centered, tinted with the node's palette fill. Shape-specific
 * visuals (diamond, circle, pill, cylinder, hexagon) come later.
 */
export function CanvasNodeView({ data }: NodeProps<CanvasNode>) {
  const color =
    NODE_COLORS.find((entry) => entry.fill === data.color) ??
    DEFAULT_NODE_COLOR;

  return (
    <div
      className="group relative flex h-full w-full items-center justify-center rounded-xl border border-subtle-border px-4 py-3 text-center"
      style={{ backgroundColor: color.fill, color: color.text }}
    >
      <p className="max-w-full text-sm leading-snug font-medium break-words">
        {data.label}
      </p>

      {HANDLES.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          className="size-2 rounded-full border-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: "var(--text-primary)" }}
        />
      ))}
    </div>
  );
}
