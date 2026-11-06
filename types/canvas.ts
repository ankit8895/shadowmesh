import type { Edge, Node } from "@xyflow/react";

/** A node fill paired with the text color that stays legible on it. */
export interface NodeColor {
  fill: string;
  text: string;
}

/** The eight node fills from `context/ui-context.md`; the first is the default. */
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const satisfies readonly NodeColor[];

/** The neutral dark fill every new node starts with. */
export const DEFAULT_NODE_COLOR = NODE_COLORS[0];

/** The supported node shapes; diamond, hexagon and cylinder render as SVGs. */
export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasShape = (typeof NODE_SHAPES)[number];

/** The data every canvas node carries, independent of how it is rendered. */
export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  /** One of the `NODE_COLORS` fills. */
  color: string;
  shape: CanvasShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;

export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">;
