"use client";

import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
} from "@xyflow/react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useUpdateNodeData } from "@/components/editor/canvas-node-actions";
import { NodeColorToolbar } from "@/components/editor/node-color-toolbar";
import { NodeShape } from "@/components/editor/node-shape";
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

/** Smallest node a resize can produce, matching the smallest default shape. */
const MIN_NODE_WIDTH = 120;
const MIN_NODE_HEIGHT = 72;

const LABEL_PLACEHOLDER = "Label";

/**
 * Renders a `canvasNode` with the shape stored in its data: rectangle, pill
 * and circle are CSS boxes, the other three are inline SVGs. Selected nodes
 * show resize handles and a floating color toolbar, and double-clicking the
 * label area edits it inline.
 */
export function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const color =
    NODE_COLORS.find((entry) => entry.fill === data.color) ??
    DEFAULT_NODE_COLOR;
  const updateNodeData = useUpdateNodeData();
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.select();
  }, [isEditing]);

  function startEditing(event: ReactMouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    setDraftLabel(data.label);
    setIsEditing(true);
  }

  function stopEditing() {
    setIsEditing(false);
  }

  return (
    <div
      className="group relative h-full w-full"
      style={{ color: color.text }}
    >
      <NodeShape shape={data.shape} color={color.fill} selected={selected}>
        <div
          className="relative flex h-full w-full items-center justify-center"
          onDoubleClick={startEditing}
        >
          {isEditing ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <textarea
                ref={textareaRef}
                aria-label="Node label"
                rows={1}
                value={draftLabel}
                placeholder={LABEL_PLACEHOLDER}
                onChange={(event) => {
                  const label = event.target.value;
                  setDraftLabel(label);
                  updateNodeData(id, { label });
                }}
                onBlur={stopEditing}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  stopEditing();
                }}
                className="nodrag nopan nowheel field-sizing-content max-h-full w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-center text-sm leading-snug font-medium text-inherit caret-brand outline-none placeholder:text-copy-muted"
              />
            </div>
          ) : (
            <p className="max-w-full text-sm leading-snug font-medium break-words">
              {data.label || (
                <span className="opacity-50">{LABEL_PLACEHOLDER}</span>
              )}
            </p>
          )}
        </div>
      </NodeShape>

      <NodeColorToolbar
        nodeId={id}
        activeColor={data.color}
        isVisible={selected}
      />

      {HANDLES.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          className="size-2 rounded-full border-solid opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            width: 8,
            height: 8,
            backgroundColor: "var(--text-primary)",
            borderColor: "var(--bg-base)",
            borderWidth: 1,
          }}
        />
      ))}

      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color="var(--accent-primary)"
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: "9999px",
          borderColor: "var(--bg-base)",
        }}
      />
    </div>
  );
}
