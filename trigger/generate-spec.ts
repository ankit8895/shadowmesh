import { createGoogle } from "@ai-sdk/google";
import { generateText } from "ai";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk";

import { publishAiStatus } from "../lib/ai-status";
import {
  generateSpecPayloadSchema,
  type GenerateSpecPayload,
} from "../lib/spec-input";
import { saveProjectSpec } from "../lib/spec-store";
import type { AiTaskStatus } from "../types/tasks";
import { geminiApiKey } from "./keys";

const MODEL_ID = "gemini-2.5-flash";

/** The prompt is trimmed further than the request caps to bound its size. */
const MAX_PROMPT_NODES = 120;
const MAX_PROMPT_EDGES = 160;
const MAX_PROMPT_CHAT_MESSAGES = 30;

/**
 * The provider reads the runtime API key so the model calls succeed against the
 * actual Gemini endpoint. A new instance is created per run, matching the
 * design agent, rather than adding a shared provider abstraction.
 */
function googleProvider(): ReturnType<typeof createGoogle> {
  return createGoogle({ apiKey: geminiApiKey() });
}

function buildSystemPrompt(): string {
  return [
    "You are Shadowmesh, a staff software architect writing a technical specification for the system drawn on a shared canvas.",
    "Write an implementation-ready Markdown document grounded in the provided canvas graph and conversation.",
    "Do not invent services or technologies that the graph or chat do not imply; group and explain what is there instead.",
    "Use exactly these top-level sections, in this order:",
    "# <a short spec title>",
    "## Overview",
    "## Architecture",
    "## Data Flow",
    "## Data Model",
    "## Interfaces",
    "## Operational Concerns",
    "## Open Questions",
    "Reference nodes by their labels. Prefer short paragraphs, bullet lists and tables where they make the design clearer.",
    "Reply with plain Markdown only: no code fences around the whole document and no commentary outside it.",
  ].join("\n");
}

function buildCanvasContext(payload: GenerateSpecPayload): string {
  const nodes = payload.nodes.slice(0, MAX_PROMPT_NODES).map((node) => ({
    id: node.id,
    label: (node.data?.label ?? "").trim() || node.id,
    shape: node.data?.shape,
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = payload.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .slice(0, MAX_PROMPT_EDGES)
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: (edge.data?.label ?? "").trim(),
    }));

  if (nodes.length === 0) {
    return "Canvas: empty.";
  }

  return `Canvas (JSON):\n${JSON.stringify({ nodes, edges })}`;
}

function buildChatContext(
  history: GenerateSpecPayload["chatHistory"],
): string {
  const messages = history.slice(-MAX_PROMPT_CHAT_MESSAGES);

  if (messages.length === 0) {
    return "Conversation: none.";
  }

  return `Conversation:\n${messages
    .map(
      (message) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
    )
    .join("\n")}`;
}

/** Status publishing must never fail the run that is reporting it. */
async function publishStatus(
  roomId: string,
  status: AiTaskStatus,
  text: string,
): Promise<void> {
  try {
    await publishAiStatus(roomId, { status, kind: "spec", text });
  } catch (error) {
    logger.warn("Unable to publish the spec status.", { error });
  }
}

/**
 * Turns the room's canvas graph and chat context into a Markdown technical
 * spec. Progress goes to the shared `ai-status-feed` and to Trigger run
 * metadata; the finished Markdown is stored in Blob and the run returns only
 * the ID of the saved spec.
 */
export const generateSpec = schemaTask({
  id: "generate-spec",
  maxDuration: 300,
  schema: generateSpecPayloadSchema,
  run: async (payload, { ctx }) => {
    if (payload.nodes.length === 0 && payload.chatHistory.length === 0) {
      await publishStatus(
        payload.roomId,
        "error",
        "Spec failed — the canvas and conversation are both empty.",
      );

      throw new Error(
        "The canvas and conversation are empty, so there is nothing to specify.",
      );
    }

    metadata
      .set("status", "running")
      .set("phase", "reading")
      .set("nodes", payload.nodes.length)
      .set("edges", payload.edges.length);

    try {
      await publishStatus(
        payload.roomId,
        "running",
        "Spec agent started — reading the canvas.",
      );

      metadata.set("phase", "generating");

      await publishStatus(
        payload.roomId,
        "running",
        "Writing the technical spec…",
      );

      logger.log("Requesting a spec from Gemini.", {
        model: MODEL_ID,
        roomId: payload.roomId,
        runId: ctx.run.id,
        nodes: payload.nodes.length,
        edges: payload.edges.length,
        chatMessages: payload.chatHistory.length,
      });

      const { text } = await generateText({
        model: googleProvider().languageModel(MODEL_ID),
        system: buildSystemPrompt(),
        prompt: `${buildCanvasContext(payload)}\n\n${buildChatContext(
          payload.chatHistory,
        )}`,
      });

      const spec = text.trim();

      if (spec === "") {
        throw new Error("The model returned an empty spec.");
      }

      // Metadata only lives in Postgres; the Markdown itself goes to Blob.
      // The run ID doubles as the spec ID, so a retry of this run overwrites
      // its own spec instead of adding a second one.
      const stored = await saveProjectSpec(
        payload.projectId,
        spec,
        ctx.run.id,
      );

      metadata
        .set("status", "complete")
        .set("phase", "complete")
        .set("characters", spec.length)
        .set("specId", stored.id);

      await publishStatus(payload.roomId, "complete", "Spec complete.");

      logger.log("Spec generated and stored.", {
        runId: ctx.run.id,
        specId: stored.id,
        characters: spec.length,
      });

      return { specId: stored.id, characters: spec.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The spec agent failed.";

      metadata.set("status", "error").set("phase", "failed");

      logger.error("Spec generation failed.", { error, runId: ctx.run.id });

      await publishStatus(payload.roomId, "error", `Spec failed — ${message}`);

      throw error;
    }
  },
});
