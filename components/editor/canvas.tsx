"use client";

import "@xyflow/react/dist/style.css";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import { useCallback, useRef, type DragEvent } from "react";

import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import {
  DEFAULT_CANVAS_NODE_COLOR,
  parseShapeDragPayload,
  SHAPE_DRAG_MIME,
} from "@/lib/canvas-drag";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const nodeTypes = { canvasNode: CanvasNodeView } satisfies NodeTypes;

/**
 * Adds the React Flow provider above the canvas so the drop handler can use
 * `useReactFlow` to convert screen coordinates into canvas coordinates.
 */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}

/**
 * React Flow bound to the room's Liveblocks Storage. The nodes and edges are
 * controlled by the hook, so every change is applied by Liveblocks and synced
 * to the other clients instead of living in local component state.
 */
function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const { screenToFlowPosition } = useReactFlow();
  const dropCounter = useRef(0);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    // Only claim the drop when dragging something the canvas understands, so
    // other drag sources keep their default behaviour.
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME);

      if (!raw) {
        return;
      }

      event.preventDefault();

      const payload = parseShapeDragPayload(raw);

      if (!payload) {
        return;
      }

      // The drop point becomes the node centre instead of its top-left corner.
      const point = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const node: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${dropCounter.current}`,
        type: "canvasNode",
        position: {
          x: point.x - payload.width / 2,
          y: point.y - payload.height / 2,
        },
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: DEFAULT_CANVAS_NODE_COLOR,
          shape: payload.shape,
        },
      };

      dropCounter.current += 1;

      onNodesChange([{ type: "add", item: node }] satisfies NodeChange<CanvasNode>[]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div
      data-slot="workspace-canvas"
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--border-default)"
        />
        <MiniMap
          bgColor="var(--bg-surface)"
          nodeColor="var(--accent-primary)"
          maskColor="color-mix(in srgb, var(--bg-base) 72%, transparent)"
        />
      </ReactFlow>

      <ShapePanel />
    </div>
  );
}
