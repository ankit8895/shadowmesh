import { MarkerType } from "@xyflow/react";

import {
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

/** Palette fills by name, so template data reads as colors instead of hex. */
const FILLS = {
  neutral: NODE_COLORS[0].fill,
  blue: NODE_COLORS[1].fill,
  purple: NODE_COLORS[2].fill,
  orange: NODE_COLORS[3].fill,
  red: NODE_COLORS[4].fill,
  pink: NODE_COLORS[5].fill,
  green: NODE_COLORS[6].fill,
  teal: NODE_COLORS[7].fill,
} as const;

type TemplateColor = keyof typeof FILLS;
type HandleId = "top" | "right" | "bottom" | "left";

interface TemplateNodeSpec {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: CanvasShape;
  color?: TemplateColor;
}

function templateNode({
  id,
  label,
  x,
  y,
  width,
  height,
  shape,
  color = "neutral",
}: TemplateNodeSpec): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: { label, color: FILLS[color], shape },
  };
}

interface TemplateEdgeSpec {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandleId;
  targetHandle?: HandleId;
  label?: string;
}

function templateEdge({
  id,
  source,
  target,
  sourceHandle = "right",
  targetHandle = "left",
  label = "",
}: TemplateEdgeSpec): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    sourceHandle,
    targetHandle,
    data: { label },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: "var(--text-secondary)",
    },
  };
}

/** Pre-built diagrams offered by the starter templates dialog. */
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description:
      "A web client talks to an API gateway that fans requests out to auth, orders and payments services.",
    nodes: [
      templateNode({
        id: "microservices-client",
        label: "Web Client",
        x: 0,
        y: 120,
        width: 160,
        height: 72,
        shape: "pill",
        color: "blue",
      }),
      templateNode({
        id: "microservices-gateway",
        label: "API Gateway",
        x: 220,
        y: 96,
        width: 180,
        height: 120,
        shape: "hexagon",
        color: "purple",
      }),
      templateNode({
        id: "microservices-auth",
        label: "Auth Service",
        x: 470,
        y: 0,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "orange",
      }),
      templateNode({
        id: "microservices-orders",
        label: "Orders Service",
        x: 470,
        y: 130,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "green",
      }),
      templateNode({
        id: "microservices-payments",
        label: "Payments Service",
        x: 470,
        y: 260,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "teal",
      }),
      templateNode({
        id: "microservices-orders-db",
        label: "Orders DB",
        x: 700,
        y: 120,
        width: 140,
        height: 120,
        shape: "cylinder",
        color: "pink",
      }),
    ],
    edges: [
      templateEdge({
        id: "microservices-client-gateway",
        source: "microservices-client",
        target: "microservices-gateway",
      }),
      templateEdge({
        id: "microservices-gateway-auth",
        source: "microservices-gateway",
        target: "microservices-auth",
        sourceHandle: "top",
      }),
      templateEdge({
        id: "microservices-gateway-orders",
        source: "microservices-gateway",
        target: "microservices-orders",
      }),
      templateEdge({
        id: "microservices-gateway-payments",
        source: "microservices-gateway",
        target: "microservices-payments",
        sourceHandle: "bottom",
      }),
      templateEdge({
        id: "microservices-orders-db",
        source: "microservices-orders",
        target: "microservices-orders-db",
      }),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "A commit flows through build, tests and a security scan before it can deploy.",
    nodes: [
      templateNode({
        id: "cicd-commit",
        label: "Commit",
        x: 0,
        y: 80,
        width: 120,
        height: 120,
        shape: "circle",
        color: "blue",
      }),
      templateNode({
        id: "cicd-build",
        label: "Build",
        x: 200,
        y: 104,
        width: 160,
        height: 72,
        shape: "pill",
        color: "purple",
      }),
      templateNode({
        id: "cicd-test",
        label: "Test",
        x: 420,
        y: 20,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "orange",
      }),
      templateNode({
        id: "cicd-scan",
        label: "Security Scan",
        x: 420,
        y: 180,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "pink",
      }),
      templateNode({
        id: "cicd-deploy",
        label: "Deploy",
        x: 660,
        y: 80,
        width: 180,
        height: 120,
        shape: "hexagon",
        color: "green",
      }),
    ],
    edges: [
      templateEdge({
        id: "cicd-commit-build",
        source: "cicd-commit",
        target: "cicd-build",
      }),
      templateEdge({
        id: "cicd-build-test",
        source: "cicd-build",
        target: "cicd-test",
        sourceHandle: "top",
      }),
      templateEdge({
        id: "cicd-build-scan",
        source: "cicd-build",
        target: "cicd-scan",
        sourceHandle: "bottom",
      }),
      templateEdge({
        id: "cicd-test-deploy",
        source: "cicd-test",
        target: "cicd-deploy",
      }),
      templateEdge({
        id: "cicd-scan-deploy",
        source: "cicd-scan",
        target: "cicd-deploy",
      }),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "A producer publishes to an event bus that delivers events to consumers and a notifier, with a dead letter queue.",
    nodes: [
      templateNode({
        id: "event-producer",
        label: "Producer",
        x: 0,
        y: 120,
        width: 120,
        height: 120,
        shape: "circle",
        color: "teal",
      }),
      templateNode({
        id: "event-bus",
        label: "Event Bus",
        x: 200,
        y: 96,
        width: 180,
        height: 140,
        shape: "hexagon",
        color: "purple",
      }),
      templateNode({
        id: "event-consumer-a",
        label: "Consumer A",
        x: 460,
        y: 0,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "blue",
      }),
      templateNode({
        id: "event-consumer-b",
        label: "Consumer B",
        x: 460,
        y: 140,
        width: 160,
        height: 100,
        shape: "rectangle",
        color: "green",
      }),
      templateNode({
        id: "event-dlq",
        label: "Dead Letter Queue",
        x: 460,
        y: 290,
        width: 140,
        height: 110,
        shape: "cylinder",
        color: "red",
      }),
      templateNode({
        id: "event-notifier",
        label: "Notifier",
        x: 700,
        y: 60,
        width: 160,
        height: 72,
        shape: "pill",
        color: "orange",
      }),
    ],
    edges: [
      templateEdge({
        id: "event-producer-bus",
        source: "event-producer",
        target: "event-bus",
      }),
      templateEdge({
        id: "event-bus-consumer-a",
        source: "event-bus",
        target: "event-consumer-a",
        sourceHandle: "top",
      }),
      templateEdge({
        id: "event-bus-consumer-b",
        source: "event-bus",
        target: "event-consumer-b",
      }),
      templateEdge({
        id: "event-bus-dlq",
        source: "event-bus",
        target: "event-dlq",
        sourceHandle: "bottom",
        targetHandle: "top",
      }),
      templateEdge({
        id: "event-bus-notifier",
        source: "event-bus",
        target: "event-notifier",
        sourceHandle: "right",
      }),
    ],
  },
];
