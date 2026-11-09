"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useUpdateEdgeLabel } from "@/components/editor/canvas-edge-actions";
import type { CanvasEdge } from "@/types/canvas";

const LABEL_PLACEHOLDER = "Label";

/**
 * Custom `canvasEdge` renderer: right-angle smooth-step routing with a thin
 * dimmed stroke that brightens on hover or selection. The invisible interaction
 * path widens the hit area without changing the visible line, and the label is
 * positioned from the path midpoint and edited inline.
 */
export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const updateEdgeLabel = useUpdateEdgeLabel();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const label = data?.label ?? "";

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [isEditing]);

  function startEditing(event: ReactMouseEvent<Element>) {
    event.stopPropagation();
    setDraftLabel(label);
    setIsEditing(true);
  }

  function commitLabel() {
    updateEdgeLabel(id, draftLabel.trim());
    setIsEditing(false);
  }

  const strokeColor = selected
    ? "var(--text-primary)"
    : isHovered
      ? "var(--text-secondary)"
      : "var(--text-muted)";
  // React Flow only exposes the rendered marker URL, not its color, so each
  // state gets its own tiny marker whose fill follows the line.
  const markerId = `canvas-edge-arrow-${id}-${selected ? "selected" : isHovered ? "hovered" : "idle"}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          className="react-flow__arrowhead"
          markerWidth={16}
          markerHeight={16}
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
          refX={0}
          refY={0}
        >
          <path d="M -5,-4 L 0,0 L -5,4 Z" fill={strokeColor} />
        </marker>
      </defs>

      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
      >
        <BaseEdge
          path={edgePath}
          markerEnd={`url(#${markerId})`}
          interactionWidth={24}
          style={{
            stroke: strokeColor,
            strokeWidth: 1.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            transition: "stroke 150ms ease",
          }}
        />
      </g>

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel absolute"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: isEditing || label ? "all" : "none",
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              aria-label="Edge label"
              value={draftLabel}
              placeholder={LABEL_PLACEHOLDER}
              onChange={(event) => setDraftLabel(event.target.value)}
              onBlur={commitLabel}
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== "Escape") {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                commitLabel();
              }}
              className="field-sizing-content min-w-16 max-w-56 rounded-full border border-brand bg-surface px-2 py-0.5 text-center text-xs font-medium text-copy-primary caret-brand shadow-surface-2 outline-none placeholder:text-copy-faint"
            />
          ) : label ? (
            <button
              type="button"
              aria-label={`Edit edge label: ${label}`}
              onDoubleClick={startEditing}
              className="cursor-text rounded-full border border-surface-border bg-surface px-2 py-0.5 text-xs font-medium text-copy-secondary shadow-surface-2"
            >
              {label}
            </button>
          ) : selected ? (
            <span className="rounded-full border border-dashed border-surface-border px-2 py-0.5 text-[11px] text-copy-faint">
              Add label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
