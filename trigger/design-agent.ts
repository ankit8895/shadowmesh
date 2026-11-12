import { createGoogle } from "@ai-sdk/google";
import { generateText } from "ai";
import { logger, task } from "@trigger.dev/sdk";

import { parseAiDesignPlan, AI_MAX_OPERATIONS } from "../lib/ai-canvas";
import { publishAiStatus } from "../lib/ai-status";
import {
  AI_MAX_ACTIVITY_ENTRIES,
  type AiActivityEntry,
  type AiTaskStatus,
} from "../types/tasks";
import { NODE_COLORS, NODE_SHAPES } from "../types/canvas";
import {
  applyAiOperations,
  clearAiPresence,
  readAiCanvas,
  setAiPresence,
  type AiCanvasSummary,
} from "./design-room";
import { geminiApiKey } from "./keys";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

const MODEL_ID = "gemini-2.5-flash";

/**
 * A provider configured with the runtime API key so the model calls succeed
 * against the actual Gemini endpoint (the default `google` provider reads
 * `GOOGLE_GENERATIVE_AI_API_KEY`, which is not how the key is stored here).
 *
 * A new instance is created per run so the key is read from the latest
 * env at run time and the provider is safe to serialize across the Trigger
 * worker boundary.
 */
function googleProvider(): ReturnType<typeof createGoogle> {
  return createGoogle({ apiKey: geminiApiKey() });
}

/** The canvas context is trimmed so a large board cannot blow up the prompt. */
const MAX_CONTEXT_NODES = 60;
const MAX_CONTEXT_EDGES = 90;

function buildSystemPrompt(): string {
  const shapes = NODE_SHAPES.join(", ");
  const colors = NODE_COLORS.map(
    (color) => `${color.name}=${color.fill}`,
  ).join(", ");

  return [
    "You are Shadowmesh, an AI system-design architect working on a shared React Flow canvas.",
    "Turn the user's request into canvas operations expressed as JSON.",
    "",
    "Canvas rules:",
    `- Allowed node shapes: ${shapes}.`,
    `- Allowed node fill colors: ${colors}.`,
    "- Use pill or rectangle for services and apps, cylinder for data stores, hexagon for external systems, diamond for decisions, circle for events or endpoints.",
    "- Positions are canvas pixels on a 20px grid. Lay out left-to-right or top-to-bottom with at least 200px horizontally and 160px vertically between node origins so shapes do not overlap.",
    "- Widths are 120-360px, heights are 72-280px. Keep labels short (2-40 characters).",
    "- Edges run from source node id to target node id and may carry a short label such as 'HTTP' or 'reads'.",
    "- For a brand new design, add 5-12 nodes and connect them. When the canvas already has nodes, extend or adjust it instead of duplicating it.",
    "- Only reference ids that exist in the provided canvas context or that you add in the same plan.",
    "",
    "Reply with JSON only, in exactly this shape:",
    '{"operations":[{"type":"addNode","id":"api-gateway","label":"API Gateway","shape":"pill","color":"#10233D","x":120,"y":80,"width":160,"height":72},{"type":"addEdge","id":"gateway-to-db","source":"api-gateway","target":"database","label":"reads"}]}',
    "",
    `Allowed operation types: addNode, moveNode, resizeNode, updateNode, deleteNode, addEdge, deleteEdge. Send at most ${AI_MAX_OPERATIONS} operations.`,
    "moveNode takes id, x, y. resizeNode takes id, width, height. updateNode takes id plus any of label, color, shape. deleteNode and deleteEdge take id.",
    "Do not include commentary, markdown fences or any text outside the JSON object.",
  ].join("\n");
}

function buildCanvasContext(canvas: AiCanvasSummary): string {
  if (canvas.nodes.length === 0) {
    return "Canvas context: the canvas is empty.";
  }

  const nodes = canvas.nodes.slice(0, MAX_CONTEXT_NODES).map((node) => ({
    id: node.id,
    label: node.label,
    shape: node.shape,
    color: node.color,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  }));

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = canvas.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .slice(0, MAX_CONTEXT_EDGES)
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));

  return `Canvas context (JSON):\n${JSON.stringify({ nodes, edges })}`;
}

/** Models sometimes wrap JSON in prose or fences despite instructions. */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

class DesignRunReporter {
  private readonly activity: AiActivityEntry[] = [];
  private readonly startedAt = Date.now();

  constructor(
    private readonly roomId: string,
    private readonly runId: string,
  ) {}

  get entries(): AiActivityEntry[] {
    return this.activity;
  }

  async report(
    status: AiTaskStatus,
    message: string,
    thinking: boolean,
    cursor: { x: number; y: number } | null = null,
  ): Promise<void> {
    this.activity.push({
      id: `activity-${this.activity.length + 1}`,
      message,
      at: Date.now(),
    });

    try {
      await publishAiStatus(this.roomId, {
        status,
        text: message,
        kind: "design",
      });
    } catch (error) {
      logger.warn("Unable to publish the design status.", { error });
    }

    if (status === "running") {
      try {
        await setAiPresence(this.roomId, { cursor, thinking });
      } catch (error) {
        logger.warn("Unable to publish AI presence.", { error });
      }
    }
  }

  get elapsedMs(): number {
    return Date.now() - this.startedAt;
  }
}

/**
 * Generates a design with Gemini and writes it into the room's synced canvas.
 * Every step publishes status for all participants, and the AI's presence is
 * cleared whatever the outcome.
 */
export const designAgent = task({
  id: "design-agent",
  maxDuration: 300,
  run: async (payload: DesignAgentPayload, { ctx }) => {
    if (!payload.roomId || !payload.prompt.trim()) {
      throw new Error("A room ID and a prompt are required.");
    }

    const reporter = new DesignRunReporter(payload.roomId, ctx.run.id);

    try {
      await reporter.report(
        "running",
        "Design agent started — reading the canvas.",
        true,
      );

      const canvas = await readAiCanvas(payload.roomId);

      await reporter.report(
        "running",
        "Thinking through the architecture…",
        true,
      );

      logger.log("Requesting a design plan from Gemini.", {
        model: MODEL_ID,
        roomId: payload.roomId,
        existingNodes: canvas.nodes.length,
      });

      const model = googleProvider().languageModel(MODEL_ID);

      const { text } = await generateText({
        model,
        system: buildSystemPrompt(),
        prompt: `${buildCanvasContext(canvas)}\n\nUser request:\n${payload.prompt.trim()}`,
      });

      const json = extractJsonObject(text);

      if (!json) {
        throw new Error("The model did not return a JSON design plan.");
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(json);
      } catch {
        throw new Error("The model returned a design plan that is not valid JSON.");
      }

      const plan = parseAiDesignPlan(parsed);

      if (!plan.ok) {
        throw new Error(plan.error);
      }

      await reporter.report(
        "running",
        "Applying the design to the shared canvas…",
        true,
      );

      const counts = await applyAiOperations(payload.roomId, plan.operations);

      const firstNode = plan.operations.find(
        (operation) => operation.type === "addNode",
      );
      const cursor =
        firstNode && firstNode.type === "addNode"
          ? { x: firstNode.x, y: firstNode.y }
          : null;

      const summary = `${counts.addedNodes} nodes and ${counts.addedEdges} edges added${counts.skipped > 0 ? `, ${counts.skipped} skipped` : ""}.`;

      try {
        await setAiPresence(payload.roomId, {
          cursor,
          thinking: false,
        });
      } catch (error) {
        logger.warn("Unable to move AI presence.", { error });
      }

      await reporter.report("complete", `Design complete — ${summary}`, false);

      logger.log("Design applied.", {
        ...counts,
        runId: ctx.run.id,
        elapsedMs: reporter.elapsedMs,
      });

      return {
        roomId: payload.roomId,
        status: "complete" as const,
        ...counts,
        activity: reporter.entries.slice(-AI_MAX_ACTIVITY_ENTRIES),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The design agent failed.";

      logger.error("Design generation failed.", { error });

      await reporter.report(
        "error",
        `Design failed — ${message}`,
        false,
      );

      throw error;
    } finally {
      try {
        await clearAiPresence(payload.roomId);
      } catch (error) {
        logger.warn("Unable to clear AI presence.", { error });
      }
    }
  },
});
