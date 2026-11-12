import { z } from "zod";

/**
 * Shared contract for room-scoped AI task activity. Status messages and chat
 * messages travel through separate Liveblocks feeds, so progress indicators
 * never mix with the conversation, and each feed can be read on its own.
 */

/** Liveblocks feed ID that carries AI activity in every room. */
export const AI_STATUS_FEED_ID = "ai-status-feed";

/** Liveblocks feed ID that carries room chat in every room. */
export const AI_CHAT_FEED_ID = "ai-chat";

/** The AI work a status message describes. */
export const AI_TASK_KINDS = ["design", "spec"] as const;

export type AiTaskKind = (typeof AI_TASK_KINDS)[number];

/** Lifecycle of one AI task run. */
export const AI_TASK_STATUSES = ["running", "complete", "error"] as const;

export type AiTaskStatus = (typeof AI_TASK_STATUSES)[number];

/** One message in the `ai-status-feed` Liveblocks feed. */
export interface AiStatusFeedPayload {
  status: AiTaskStatus;
  /** Optional status line; the sidebar shows it while it is present. */
  text?: string;
  kind?: AiTaskKind;
}

/** How many activity entries a task keeps for its run result. */
export const AI_MAX_ACTIVITY_ENTRIES = 6;

/** Longest chat message accepted into the feed; also caps the composer. */
export const AI_CHAT_MAX_CONTENT_LENGTH = 2000;

/**
 * The largest timestamp a JavaScript `Date` can represent. A larger value would
 * throw when formatted, so chat messages above it are rejected on read.
 */
export const MAX_CHAT_TIMESTAMP = 8_640_000_000_000_000;

/**
 * A `running` status older than this cannot belong to a live run: the agent
 * task gives up after five minutes, so a stale status must not keep the room's
 * composer disabled.
 */
export const AI_RUN_STALE_AFTER_MS = 5 * 60 * 1000 + 60 * 1000;

export interface AiActivityEntry {
  id: string;
  message: string;
  at: number;
}

/**
 * One message in the `ai-chat` Liveblocks feed. Messages carry who said it, so
 * every participant renders the same conversation; `assistant` is used for the
 * replies the AI sidebar posts back into the room.
 */
export const aiChatMessageSchema = z.object({
  sender: z.string().trim().min(1).max(80),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(AI_CHAT_MAX_CONTENT_LENGTH),
  /** Creation time in milliseconds since the epoch. */
  timestamp: z.number().int().nonnegative().max(MAX_CHAT_TIMESTAMP),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  options: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (options as readonly string[]).includes(value)
  );
}

export function isAiTaskStatus(value: unknown): value is AiTaskStatus {
  return isOneOf(AI_TASK_STATUSES, value);
}

/**
 * Feed data arrives untyped, so a message is rebuilt from its validated fields
 * instead of trusted as-is. Malformed messages are dropped rather than shown.
 */
export function parseAiStatusFeedPayload(
  value: unknown,
): AiStatusFeedPayload | null {
  if (!isRecord(value) || !isAiTaskStatus(value.status)) {
    return null;
  }

  const payload: AiStatusFeedPayload = { status: value.status };
  const text = typeof value.text === "string" ? value.text.trim() : "";

  if (text) {
    payload.text = text;
  }

  if (isOneOf(AI_TASK_KINDS, value.kind)) {
    payload.kind = value.kind;
  }

  return payload;
}

/** Validates one `ai-chat` feed message before it is rendered. */
export function parseAiChatMessage(value: unknown): AiChatMessage | null {
  const result = aiChatMessageSchema.safeParse(value);

  return result.success ? result.data : null;
}
