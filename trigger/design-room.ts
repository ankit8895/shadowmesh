import { LiveMap, LiveObject, type Lson } from "@liveblocks/client";

import type { AiDesignOperation, OccupiedNode } from "../lib/ai-canvas";
import { placeNewNode, snapToGrid } from "../lib/ai-canvas";
import { AI_CURSOR_COLOR, AI_USER_ID, AI_USER_NAME } from "../lib/ai-status";
import { getLiveblocks } from "../lib/liveblocks";

/** `@liveblocks/react-flow` stores the diagram under this key by default. */
export const FLOW_STORAGE_KEY = "flow";

const FLOW_NODE_TYPE = "canvasNode";
const FLOW_EDGE_TYPE = "canvasEdge";

export interface AiCanvasNodeSummary {
  id: string;
  label: string;
  shape: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AiCanvasEdgeSummary {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface AiCanvasSummary {
  nodes: AiCanvasNodeSummary[];
  edges: AiCanvasEdgeSummary[];
}

export interface AiOperationCounts {
  addedNodes: number;
  movedNodes: number;
  resizedNodes: number;
  updatedNodes: number;
  deletedNodes: number;
  addedEdges: number;
  deletedEdges: number;
  skipped: number;
}

function emptyCounts(): AiOperationCounts {
  return {
    addedNodes: 0,
    movedNodes: 0,
    resizedNodes: 0,
    updatedNodes: 0,
    deletedNodes: 0,
    addedEdges: 0,
    deletedEdges: 0,
    skipped: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Storage JSON serializes LiveMaps either as objects or as arrays of entries. */
function toEntries(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return Object.values(value);
  }

  return [];
}

function summarizeNode(value: unknown): AiCanvasNodeSummary | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  const position = isRecord(value.position) ? value.position : {};
  const data = isRecord(value.data) ? value.data : {};

  return {
    id: value.id,
    label: typeof data.label === "string" ? data.label : "",
    shape: typeof data.shape === "string" ? data.shape : "rectangle",
    color: typeof data.color === "string" ? data.color : "",
    x: readNumber(position.x, 0),
    y: readNumber(position.y, 0),
    width: readNumber(value.width, 160),
    height: readNumber(value.height, 100),
  };
}

function summarizeEdge(value: unknown): AiCanvasEdgeSummary | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.source !== "string" ||
    typeof value.target !== "string"
  ) {
    return null;
  }

  const data = isRecord(value.data) ? value.data : {};

  return {
    id: value.id,
    source: value.source,
    target: value.target,
    label: typeof data.label === "string" ? data.label : "",
  };
}

/** Reads the room's current diagram so the model can extend it. */
export async function readAiCanvas(roomId: string): Promise<AiCanvasSummary> {
  // A room without storage answers `null`; a failed request throws so the run
  // fails instead of designing on top of a canvas it could not read.
  const document: unknown = await getLiveblocks().getStorageDocument(
    roomId,
    "json",
  );

  if (!isRecord(document) || !isRecord(document[FLOW_STORAGE_KEY])) {
    return { nodes: [], edges: [] };
  }

  const flow = document[FLOW_STORAGE_KEY];
  const nodes = toEntries(flow.nodes)
    .map(summarizeNode)
    .filter((node): node is AiCanvasNodeSummary => node !== null);
  const edges = toEntries(flow.edges)
    .map(summarizeEdge)
    .filter((edge): edge is AiCanvasEdgeSummary => edge !== null);

  return { nodes, edges };
}

/**
 * The room canvas is created by the client on first open. A task that runs
 * before anyone joins creates it here so the generated diagram is not lost.
 */
function ensureFlow(root: LiveObject<Record<string, Lson>>): LiveObject<Record<string, Lson>> {
  const existing = root.get(FLOW_STORAGE_KEY);

  if (existing instanceof LiveObject) {
    return existing as LiveObject<Record<string, Lson>>;
  }

  const flow = new LiveObject<Record<string, Lson>>({
    nodes: new LiveMap<string, Lson>(),
    edges: new LiveMap<string, Lson>(),
  });

  root.set(FLOW_STORAGE_KEY, flow);

  return flow;
}

function readData(node: LiveObject<Record<string, Lson>>): LiveObject<Record<string, Lson>> | null {
  const data = node.get("data");

  return data instanceof LiveObject
    ? (data as LiveObject<Record<string, Lson>>)
    : null;
}

/**
 * Applies the whole plan in one storage mutation, using the same
 * `LiveObject` / `LiveMap` shapes `@liveblocks/react-flow` writes, so every
 * connected canvas renders the change without a special code path.
 */
export async function applyAiOperations(
  roomId: string,
  operations: AiDesignOperation[],
): Promise<AiOperationCounts> {
  let result: AiOperationCounts | null = null;

  await getLiveblocks().mutateStorage(roomId, ({ root }) => {
    // A conflicting mutation re-runs this callback, so the counters and the
    // layout bookkeeping are rebuilt from the room's current nodes here.
    const counts = emptyCounts();
    const flow = ensureFlow(root as LiveObject<Record<string, Lson>>);
    const nodes = flow.get("nodes");
    const edges = flow.get("edges");

    if (
      !(nodes instanceof LiveMap) ||
      !(edges instanceof LiveMap)
    ) {
      throw new Error("The room canvas is not in the expected shape.");
    }

    // The plan is applied against the live node map, not the pre-run read, so
    // nodes added by collaborators while the model was thinking still count.
    const currentNodes = Object.values(
      nodes.toJSON() as Record<string, unknown>,
    )
      .map(summarizeNode)
      .filter((node): node is AiCanvasNodeSummary => node !== null);
    const occupied: OccupiedNode[] = currentNodes.map((node) => ({
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
    }));
    const knownNodeIds = new Set(currentNodes.map((node) => node.id));

    for (const operation of operations) {
      switch (operation.type) {
        case "addNode": {
          if (nodes.get(operation.id)) {
            counts.skipped += 1;
            break;
          }

          const position = placeNewNode(
            {
              x: operation.x,
              y: operation.y,
              width: operation.width,
              height: operation.height,
            },
            occupied,
          );

          nodes.set(
            operation.id,
            new LiveObject({
              id: operation.id,
              type: FLOW_NODE_TYPE,
              position,
              width: operation.width,
              height: operation.height,
              data: new LiveObject({
                label: operation.label,
                color: operation.color,
                shape: operation.shape,
              }),
            }),
          );

          occupied.push({ ...position, width: operation.width, height: operation.height });
          knownNodeIds.add(operation.id);
          counts.addedNodes += 1;
          break;
        }
        case "moveNode": {
          const node = nodes.get(operation.id);

          if (!(node instanceof LiveObject)) {
            counts.skipped += 1;
            break;
          }

          node.set("position", {
            x: snapToGrid(operation.x),
            y: snapToGrid(operation.y),
          });
          counts.movedNodes += 1;
          break;
        }
        case "resizeNode": {
          const node = nodes.get(operation.id);

          if (!(node instanceof LiveObject)) {
            counts.skipped += 1;
            break;
          }

          node.set("width", operation.width);
          node.set("height", operation.height);
          counts.resizedNodes += 1;
          break;
        }
        case "updateNode": {
          const node = nodes.get(operation.id);

          if (!(node instanceof LiveObject)) {
            counts.skipped += 1;
            break;
          }

          const data = readData(node as LiveObject<Record<string, Lson>>);

          if (!data) {
            counts.skipped += 1;
            break;
          }

          if (operation.label !== undefined) {
            data.set("label", operation.label);
          }

          if (operation.color !== undefined) {
            data.set("color", operation.color);
          }

          if (operation.shape !== undefined) {
            data.set("shape", operation.shape);
          }

          counts.updatedNodes += 1;
          break;
        }
        case "deleteNode": {
          if (!nodes.get(operation.id)) {
            counts.skipped += 1;
            break;
          }

          // Read the edge map itself: edges added earlier in this same plan
          // would not appear in the pre-run snapshot.
          for (const [edgeId, edge] of Object.entries(
            edges.toJSON() as Record<string, unknown>,
          )) {
            const summary = summarizeEdge(edge);

            if (
              summary &&
              (summary.source === operation.id ||
                summary.target === operation.id)
            ) {
              edges.delete(edgeId);
              counts.deletedEdges += 1;
            }
          }

          nodes.delete(operation.id);
          knownNodeIds.delete(operation.id);
          counts.deletedNodes += 1;
          break;
        }
        case "addEdge": {
          if (
            !knownNodeIds.has(operation.source) ||
            !knownNodeIds.has(operation.target) ||
            edges.get(operation.id)
          ) {
            counts.skipped += 1;
            break;
          }

          edges.set(
            operation.id,
            new LiveObject({
              id: operation.id,
              type: FLOW_EDGE_TYPE,
              source: operation.source,
              target: operation.target,
              data: new LiveObject({ label: operation.label }),
            }),
          );
          counts.addedEdges += 1;
          break;
        }
        case "deleteEdge": {
          if (!edges.get(operation.id)) {
            counts.skipped += 1;
            break;
          }

          edges.delete(operation.id);
          counts.deletedEdges += 1;
          break;
        }
      }
    }

    result = counts;
  });

  return result ?? emptyCounts();
}

export interface AiPresence {
  cursor: { x: number; y: number } | null;
  thinking: boolean;
}

/**
 * Server-set presence is the Liveblocks mechanism for an agent that is not
 * connected over a WebSocket. The TTL expires the presence automatically if a
 * run dies without clearing it.
 */
export async function setAiPresence(
  roomId: string,
  presence: AiPresence,
  ttl = 600,
): Promise<void> {
  await getLiveblocks().setPresence(roomId, {
    userId: AI_USER_ID,
    data: { cursor: presence.cursor, thinking: presence.thinking },
    userInfo: {
      name: AI_USER_NAME,
      avatar: "",
      cursorColor: AI_CURSOR_COLOR,
    },
    ttl,
  });
}

/** Clears the agent's presence; the short TTL removes it almost immediately. */
export async function clearAiPresence(roomId: string): Promise<void> {
  await setAiPresence(roomId, { cursor: null, thinking: false }, 2);
}

