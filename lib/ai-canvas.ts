import { NODE_SHAPE_SIZES } from "./canvas-drag";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasShape,
} from "../types/canvas";

/**
 * The canonical canvas operations the design agent may perform. The Gemini
 * response is parsed into this union, so nothing from the model reaches Storage
 * unchecked.
 */
export type AiDesignOperation =
  | {
      type: "addNode";
      id: string;
      label: string;
      shape: CanvasShape;
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | { type: "moveNode"; id: string; x: number; y: number }
  | { type: "resizeNode"; id: string; width: number; height: number }
  | {
      type: "updateNode";
      id: string;
      label?: string;
      color?: string;
      shape?: CanvasShape;
    }
  | { type: "deleteNode"; id: string }
  | { type: "addEdge"; id: string; source: string; target: string; label: string }
  | { type: "deleteEdge"; id: string };

export type AiDesignPlanResult =
  | { ok: true; operations: AiDesignOperation[] }
  | { ok: false; error: string };

/** A single model response may not rewrite the whole board at once. */
export const AI_MAX_OPERATIONS = 24;

/** Node labels are short because they render inside the shape. */
const MAX_LABEL_LENGTH = 80;
const MAX_ID_LENGTH = 48;

/** Layout rules: 20px grid, at least 40px between shapes. */
export const NODE_GRID = 20;
export const NODE_MIN_GAP = 40;

const MIN_WIDTH = 120;
const MIN_HEIGHT = 72;
const MAX_WIDTH = 360;
const MAX_HEIGHT = 280;

export interface OccupiedNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isShape(value: unknown): value is CanvasShape {
  return (
    typeof value === "string" &&
    (NODE_SHAPES as readonly string[]).includes(value)
  );
}

function resolveColor(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return NODE_COLORS.some((color) => color.fill === value) ? value : null;
}

function resolveShape(value: unknown): CanvasShape {
  return isShape(value) ? value : "rectangle";
}

function clampDimension(value: unknown, fallback: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(MIN_WIDTH, Math.round(value)));
}

function clampHeight(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(value)));
}

function toCoordinate(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
}

/** Ids are generated from the model's slug, so Storage keys stay predictable. */
export function sanitizeNodeId(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_ID_LENGTH);
}

function sanitizeLabel(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, MAX_LABEL_LENGTH)
    : "";
}

export function snapToGrid(value: number): number {
  return Math.max(0, Math.round(value / NODE_GRID) * NODE_GRID);
}

function overlaps(a: OccupiedNode, b: OccupiedNode): boolean {
  return (
    a.x < b.x + b.width + NODE_MIN_GAP &&
    a.x + a.width + NODE_MIN_GAP > b.x &&
    a.y < b.y + b.height + NODE_MIN_GAP &&
    a.y + a.height + NODE_MIN_GAP > b.y
  );
}

/**
 * Keeps generated nodes on the grid and pushes them down when the model places
 * two shapes on top of each other, so a generated diagram stays readable.
 */
export function placeNewNode(
  candidate: OccupiedNode,
  occupied: OccupiedNode[],
): { x: number; y: number } {
  const width = candidate.width;
  const height = candidate.height;
  const x = snapToGrid(candidate.x);
  let y = snapToGrid(candidate.y);
  let attempts = 0;

  while (
    attempts < 40 &&
    occupied.some((node) => overlaps({ x, y, width, height }, node))
  ) {
    y += snapToGrid(height + NODE_MIN_GAP);
    attempts += 1;
  }

  return { x, y };
}

function parseAddNode(
  raw: Record<string, unknown>,
  index: number,
): AiDesignOperation | null {
  const id = sanitizeNodeId(raw.id) || `ai-node-${index}`;

  if (id === "") {
    return null;
  }

  const shape = resolveShape(raw.shape);
  const defaults = NODE_SHAPE_SIZES[shape];

  return {
    type: "addNode",
    id,
    label: sanitizeLabel(raw.label),
    shape,
    color: resolveColor(raw.color) ?? DEFAULT_NODE_COLOR.fill,
    x: toCoordinate(raw.x, index * 40),
    y: toCoordinate(raw.y, index * 40),
    width: clampDimension(raw.width, defaults.width, MAX_WIDTH),
    height: clampHeight(raw.height, defaults.height),
  };
}

function parseOperation(
  value: unknown,
  index: number,
): AiDesignOperation | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    return null;
  }

  switch (value.type) {
    case "addNode":
      return parseAddNode(value, index);
    case "moveNode": {
      const id = sanitizeNodeId(value.id);

      if (!id) {
        return null;
      }

      return {
        type: "moveNode",
        id,
        x: toCoordinate(value.x, 0),
        y: toCoordinate(value.y, 0),
      };
    }
    case "resizeNode": {
      const id = sanitizeNodeId(value.id);

      if (!id) {
        return null;
      }

      return {
        type: "resizeNode",
        id,
        width: clampDimension(value.width, MIN_WIDTH, MAX_WIDTH),
        height: clampHeight(value.height, MIN_HEIGHT),
      };
    }
    case "updateNode": {
      const id = sanitizeNodeId(value.id);

      if (!id) {
        return null;
      }

      const label =
        typeof value.label === "string" ? sanitizeLabel(value.label) : undefined;
      const color = resolveColor(value.color) ?? undefined;
      const shape = isShape(value.shape) ? value.shape : undefined;

      if (label === undefined && color === undefined && shape === undefined) {
        return null;
      }

      return { type: "updateNode", id, label, color, shape };
    }
    case "deleteNode": {
      const id = sanitizeNodeId(value.id);

      return id ? { type: "deleteNode", id } : null;
    }
    case "addEdge": {
      const source = sanitizeNodeId(value.source);
      const target = sanitizeNodeId(value.target);

      if (!source || !target || source === target) {
        return null;
      }

      return {
        type: "addEdge",
        id: sanitizeNodeId(value.id) || `ai-edge-${index}`,
        source,
        target,
        label: sanitizeLabel(value.label),
      };
    }
    case "deleteEdge": {
      const id = sanitizeNodeId(value.id);

      return id ? { type: "deleteEdge", id } : null;
    }
    default:
      return null;
  }
}

/** Validates and normalizes the model's plan before anything touches Storage. */
export function parseAiDesignPlan(value: unknown): AiDesignPlanResult {
  if (!isRecord(value) || !Array.isArray(value.operations)) {
    return { ok: false, error: "The design plan must include an operations array." };
  }

  const operations: AiDesignOperation[] = [];

  for (const [index, candidate] of value.operations.entries()) {
    if (operations.length >= AI_MAX_OPERATIONS) {
      break;
    }

    const operation = parseOperation(candidate, index);

    if (operation) {
      operations.push(operation);
    }
  }

  if (operations.length === 0) {
    return { ok: false, error: "The design plan contained no usable operations." };
  }

  return { ok: true, operations };
}
