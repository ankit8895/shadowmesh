// Relative types keep this module resolvable inside the Trigger.dev bundle,
// which does not follow the app's tsconfig path aliases.
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  type CanvasShape,
} from "../types/canvas";

/** Drag payload type used by the shape panel and the canvas drop target. */
export const SHAPE_DRAG_MIME = "application/x-shadowmesh-shape";

export interface ShapeDragPayload {
  shape: CanvasShape;
  width: number;
  height: number;
}

/**
 * Default node sizes. Rectangles and pills are wider than tall, circles stay
 * square, and diamonds get extra room so labels fit inside the rotated box.
 */
/** Shared default sizes; the AI agent lays out generated nodes with them too. */
export const NODE_SHAPE_SIZES: Record<
  CanvasShape,
  { width: number; height: number }
> = {
  rectangle: { width: 160, height: 100 },
  diamond: { width: 180, height: 180 },
  circle: { width: 120, height: 120 },
  pill: { width: 160, height: 72 },
  cylinder: { width: 140, height: 120 },
  hexagon: { width: 160, height: 140 },
};

export function createShapeDragPayload(shape: CanvasShape): ShapeDragPayload {
  return { shape, ...NODE_SHAPE_SIZES[shape] };
}

function isCanvasShape(value: unknown): value is CanvasShape {
  return (
    typeof value === "string" &&
    (NODE_SHAPES as readonly string[]).includes(value)
  );
}

/**
 * Drag data is external input: it can be missing, hand-edited by other pages,
 * or carry a shape this build does not know. Invalid payloads return `null` and
 * the drop is ignored.
 */
export function parseShapeDragPayload(raw: string): ShapeDragPayload | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const { shape, width, height } = parsed as Record<string, unknown>;

  if (
    !isCanvasShape(shape) ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { shape, width, height };
}

/** Fill used for every node created from the shape panel. */
export const DEFAULT_CANVAS_NODE_COLOR = DEFAULT_NODE_COLOR.fill;
