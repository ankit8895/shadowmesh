import {
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShape,
} from "@/types/canvas";

/** The canvas state that is persisted to Vercel Blob. */
export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export type CanvasSnapshotResult =
  | { ok: true; data: CanvasSnapshot }
  | { ok: false; error: string };

const MAX_NODES = 5000;
const MAX_EDGES = 10000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseShape(value: unknown): CanvasShape | null {
  if (typeof value !== "string") {
    return null;
  }

  return (NODE_SHAPES as readonly string[]).includes(value)
    ? (value as CanvasShape)
    : null;
}

/**
 * Keeps only the fields that describe a node, dropping React Flow's transient
 * interaction state (`selected`, `dragging`, `measured`, …) so the stored JSON
 * stays stable across saves.
 */
function toStoredNode(node: CanvasNode): CanvasNode {
  return {
    id: node.id,
    type: "canvasNode",
    position: { x: node.position.x, y: node.position.y },
    ...(node.width === undefined ? {} : { width: node.width }),
    ...(node.height === undefined ? {} : { height: node.height }),
    data: {
      label: node.data.label,
      color: node.data.color,
      shape: node.data.shape,
    },
  };
}

/**
 * The arrow marker is applied by the renderer (`normalizeEdge`), not stored:
 * there is no UI for changing it, and persisting it only created a field that
 * `parseEdge` discarded on load.
 */
function toStoredEdge(edge: CanvasEdge): CanvasEdge {
  return {
    id: edge.id,
    type: "canvasEdge",
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
    ...(edge.targetHandle ? { targetHandle: edge.targetHandle } : {}),
    data: { label: edge.data?.label ?? "" },
  };
}

/** Builds the persisted snapshot from the room's synced nodes and edges. */
export function createCanvasSnapshot(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): CanvasSnapshot {
  return {
    nodes: nodes.map(toStoredNode),
    edges: edges.map(toStoredEdge),
  };
}

function parseNode(value: unknown): CanvasNode | null {
  if (!isRecord(value) || !isNonEmptyString(value.id)) {
    return null;
  }

  const position = value.position;
  const data = value.data;

  if (
    !isRecord(position) ||
    !isFiniteNumber(position.x) ||
    !isFiniteNumber(position.y) ||
    !isRecord(data) ||
    typeof data.label !== "string" ||
    !isNonEmptyString(data.color)
  ) {
    return null;
  }

  const shape = parseShape(data.shape);

  if (!shape) {
    return null;
  }

  const node: CanvasNode = {
    id: value.id,
    type: "canvasNode",
    position: { x: position.x, y: position.y },
    data: { label: data.label, color: data.color, shape },
  };

  if (isFiniteNumber(value.width) && value.width > 0) {
    node.width = value.width;
  }

  if (isFiniteNumber(value.height) && value.height > 0) {
    node.height = value.height;
  }

  return node;
}

function parseEdge(value: unknown): CanvasEdge | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.source) ||
    !isNonEmptyString(value.target)
  ) {
    return null;
  }

  const data = isRecord(value.data) ? value.data : {};
  const edge: CanvasEdge = {
    id: value.id,
    type: "canvasEdge",
    source: value.source,
    target: value.target,
    data: { label: typeof data.label === "string" ? data.label : "" },
  };

  if (typeof value.sourceHandle === "string") {
    edge.sourceHandle = value.sourceHandle;
  }

  if (typeof value.targetHandle === "string") {
    edge.targetHandle = value.targetHandle;
  }

  return edge;
}

/**
 * Validates canvas JSON coming back from storage or from a client request.
 * Nothing is trusted: every node and edge is rebuilt from known fields.
 */
export function parseCanvasSnapshot(value: unknown): CanvasSnapshotResult {
  if (!isRecord(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    return {
      ok: false,
      error: "The canvas payload must include nodes and edges arrays.",
    };
  }

  if (value.nodes.length > MAX_NODES || value.edges.length > MAX_EDGES) {
    return { ok: false, error: "The canvas payload is too large to save." };
  }

  const nodes: CanvasNode[] = [];

  for (const candidate of value.nodes) {
    const node = parseNode(candidate);

    if (!node) {
      return { ok: false, error: "The canvas payload contains an invalid node." };
    }

    nodes.push(node);
  }

  const edges: CanvasEdge[] = [];

  for (const candidate of value.edges) {
    const edge = parseEdge(candidate);

    if (!edge) {
      return { ok: false, error: "The canvas payload contains an invalid edge." };
    }

    edges.push(edge);
  }

  return { ok: true, data: { nodes, edges } };
}

/** Reads and validates a canvas snapshot from a request body. */
export async function readCanvasSnapshotRequest(
  request: Request,
): Promise<CanvasSnapshotResult> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { ok: false, error: "The canvas payload must be valid JSON." };
  }

  return parseCanvasSnapshot(body);
}
