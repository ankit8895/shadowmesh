"use client";

import "@xyflow/react/dist/style.css";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useRoom } from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type EdgeTypes,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type DragEvent,
} from "react";

import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasEdgeActionsProvider } from "@/components/editor/canvas-edge-actions";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeActionsProvider } from "@/components/editor/canvas-node-actions";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import {
  DEFAULT_CANVAS_NODE_COLOR,
  parseShapeDragPayload,
  SHAPE_DRAG_MIME,
} from "@/lib/canvas-drag";
import type { CanvasEdge, CanvasNode, CanvasNodeData } from "@/types/canvas";

const nodeTypes = { canvasNode: CanvasNodeView } satisfies NodeTypes;
const edgeTypes = { canvasEdge: CanvasEdgeView } satisfies EdgeTypes;

const DEFAULT_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: "var(--text-secondary)",
} as const;

/**
 * Edges stored before the custom renderer existed have no type, data or
 * marker, so they are normalized for rendering instead of migrated in place.
 */
function normalizeEdge(edge: CanvasEdge): CanvasEdge {
  return {
    ...edge,
    type: "canvasEdge",
    data: { label: edge.data?.label ?? "" },
    markerEnd:
      edge.markerEnd && typeof edge.markerEnd === "object"
        ? { ...DEFAULT_EDGE_MARKER, ...edge.markerEnd }
        : DEFAULT_EDGE_MARKER,
  };
}

export interface CanvasProps {
  /** A template to import; cleared through `onTemplateImported` after loading. */
  template?: CanvasTemplate | null;
  onTemplateImported?: () => void;
}

/**
 * Adds the React Flow provider above the canvas so the drop handler can use
 * `useReactFlow` to convert screen coordinates into canvas coordinates.
 */
export function Canvas({ template, onTemplateImported }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlow
        template={template}
        onTemplateImported={onTemplateImported}
      />
    </ReactFlowProvider>
  );
}

/**
 * React Flow bound to the room's Liveblocks Storage. The nodes and edges are
 * controlled by the hook, so every change is applied by Liveblocks and synced
 * to the other clients instead of living in local component state.
 */
function CanvasFlow({ template, onTemplateImported }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const room = useRoom();
  const renderedEdges = useMemo(() => edges.map(normalizeEdge), [edges]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const dropCounter = useRef(0);
  const edgeCounter = useRef(0);
  const importedTemplateId = useRef<string | null>(null);
  const pendingFitNodeIds = useRef<string[] | null>(null);

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

  const handleConnect = useCallback(
    (connection: Connection) => {
      // The hook's own `onConnect` creates untyped edges, so the canvas builds
      // the edge to give every new connection the custom renderer and arrow.
      const edge: CanvasEdge = {
        id: `edge-${Date.now()}-${edgeCounter.current}`,
        type: "canvasEdge",
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: { label: "" },
        markerEnd: { ...DEFAULT_EDGE_MARKER },
      };

      edgeCounter.current += 1;

      onEdgesChange([{ type: "add", item: edge }] satisfies EdgeChange<CanvasEdge>[]);
    },
    [onEdgesChange],
  );

  const updateNodeData = useCallback(
    (id: string, data: Partial<CanvasNodeData>) => {
      const node = nodes.find((entry) => entry.id === id);

      if (!node) {
        return;
      }

      // `replace` is applied by Liveblocks to the synced node, unlike
      // `useReactFlow().updateNodeData`, which only touches the local store.
      onNodesChange([
        {
          type: "replace",
          id,
          item: { ...node, data: { ...node.data, ...data } },
        },
      ] satisfies NodeChange<CanvasNode>[]);
    },
    [nodes, onNodesChange],
  );

  // Templates replace the canvas instead of merging into it. Liveblocks'
  // `onNodesChange` / `onEdgesChange` ignore `remove` changes, so deletion has
  // to go through `onDelete`. `room.batch` groups the delete and both adds into
  // one storage mutation, keeping the import atomic and undoable in one step.
  useEffect(() => {
    if (!template) {
      importedTemplateId.current = null;
      return;
    }

    if (importedTemplateId.current === template.id) {
      return;
    }

    importedTemplateId.current = template.id;

    room.batch(() => {
      onDelete({ nodes, edges });

      onEdgesChange(
        template.edges.map((edge) => ({
          type: "add" as const,
          item: normalizeEdge({
            ...edge,
            data: { label: edge.data?.label ?? "" },
          }),
        })) satisfies EdgeChange<CanvasEdge>[],
      );

      onNodesChange(
        template.nodes.map((node) => ({
          type: "add" as const,
          item: {
            ...node,
            position: { ...node.position },
            data: { ...node.data },
          },
        })) satisfies NodeChange<CanvasNode>[],
      );
    });

    pendingFitNodeIds.current = template.nodes.map((node) => node.id);
    onTemplateImported?.();
  }, [
    template,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onDelete,
    room,
    onTemplateImported,
  ]);

  // Fit once the imported nodes actually reach the synced `nodes` prop; the
  // immediate call would still measure the nodes that were just cleared.
  useEffect(() => {
    const pendingIds = pendingFitNodeIds.current;

    if (!pendingIds) {
      return;
    }

    const nodeIds = new Set(nodes.map((node) => node.id));

    if (!pendingIds.every((id) => nodeIds.has(id))) {
      return;
    }

    pendingFitNodeIds.current = null;
    void fitView({ duration: 400, padding: 0.2 });
  }, [nodes, fitView]);

  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      const edge = edges.find((entry) => entry.id === id);

      if (!edge) {
        return;
      }

      onEdgesChange([
        {
          type: "replace",
          id,
          item: { ...edge, data: { ...edge.data, label } },
        },
      ] satisfies EdgeChange<CanvasEdge>[]);
    },
    [edges, onEdgesChange],
  );

  return (
    <div
      data-slot="workspace-canvas"
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CanvasNodeActionsProvider updateNodeData={updateNodeData}>
        <CanvasEdgeActionsProvider updateEdgeLabel={updateEdgeLabel}>
          <ReactFlow
            nodes={nodes}
            edges={renderedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onDelete={onDelete}
            connectionMode={ConnectionMode.Loose}
            // Node and edge label editing open on double-click, so the pane
            // must not zoom.
            zoomOnDoubleClick={false}
            fitView
            style={{ backgroundColor: "var(--bg-base)" }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="var(--border-default)"
            />
          </ReactFlow>
        </CanvasEdgeActionsProvider>
      </CanvasNodeActionsProvider>

      <CanvasControls />
      <ShapePanel />
    </div>
  );
}
