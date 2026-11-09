"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { useState } from "react";

import { useUpdateNodeData } from "@/components/editor/canvas-node-actions";
import { NODE_COLORS } from "@/types/canvas";

interface NodeColorToolbarProps {
  nodeId: string;
  /** The node's current `NODE_COLORS` fill. */
  activeColor: string;
  isVisible: boolean;
}

/**
 * Floating palette shown above a selected node. Each swatch applies one
 * predefined fill; the node derives the matching text color from `NODE_COLORS`,
 * so background and text always change together.
 */
export function NodeColorToolbar({
  nodeId,
  activeColor,
  isVisible,
}: NodeColorToolbarProps) {
  const updateNodeData = useUpdateNodeData();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  return (
    <NodeToolbar
      isVisible={isVisible}
      position={Position.Top}
      offset={12}
      className="nodrag nopan nowheel"
    >
      <div
        data-slot="node-color-toolbar"
        role="toolbar"
        aria-label="Node color"
        className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1 shadow-surface-3 backdrop-blur-xl"
      >
        {NODE_COLORS.map((color) => {
          const isActive = color.fill === activeColor;
          const isHovered = color.fill === hoveredColor;

          // Active swatches get a tight ring in their own text color; hovering
          // adds a small glow around it, kept close so it never looks blurry.
          const boxShadow = isActive
            ? `0 0 0 2px ${color.text}${isHovered ? `, 0 0 6px ${color.text}` : ""}`
            : isHovered
              ? `0 0 0 1px ${color.text}, 0 0 6px ${color.text}`
              : "inset 0 0 0 1px var(--border-subtle)";

          return (
            <button
              key={color.fill}
              type="button"
              aria-label={color.name}
              aria-pressed={isActive}
              title={color.name}
              onClick={() => updateNodeData(nodeId, { color: color.fill })}
              onMouseEnter={() => setHoveredColor(color.fill)}
              onMouseLeave={() => setHoveredColor(null)}
              className="size-4 rounded-full transition-[transform,box-shadow] duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{
                backgroundColor: color.fill,
                color: color.text,
                boxShadow,
              }}
            />
          );
        })}
      </div>
    </NodeToolbar>
  );
}
