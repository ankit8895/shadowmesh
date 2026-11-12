import { AI_STATUS_FEED_ID, type AiStatusFeedPayload } from "../types/tasks";
import { getLiveblocks } from "./liveblocks";

/** The presence identity the design agent uses while it works. */
export const AI_USER_ID = "shadowmesh-ai";
export const AI_USER_NAME = "Shadowmesh AI";
export const AI_CURSOR_COLOR = "#6457f9";

/** Liveblocks answers with a conflict when the feed already exists. */
const FEED_ALREADY_EXISTS_STATUS = 409;

function isFeedAlreadyExistsError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { status?: unknown }).status === FEED_ALREADY_EXISTS_STATUS
  );
}

/**
 * A feed must exist before messages can be appended, and nothing creates it
 * until an AI run starts. Creation is idempotent here so a run, or two runs at
 * once, can publish into the same room feed safely.
 *
 * Once a worker has confirmed the feed for a room it stays confirmed for the
 * process lifetime, so a run reports its statuses without a `createFeed`
 * round-trip (and a tolerated 409) on every message.
 */
const ensuredRooms = new Set<string>();

export async function ensureAiStatusFeed(roomId: string): Promise<void> {
  if (ensuredRooms.has(roomId)) {
    return;
  }

  try {
    await getLiveblocks().createFeed({ roomId, feedId: AI_STATUS_FEED_ID });
  } catch (error) {
    if (!isFeedAlreadyExistsError(error)) {
      throw error;
    }
  }

  ensuredRooms.add(roomId);
}

/**
 * Appends one status message to the room's shared feed. Messages are
 * append-only; readers render only the most recent one.
 */
export async function publishAiStatus(
  roomId: string,
  payload: AiStatusFeedPayload,
): Promise<void> {
  await ensureAiStatusFeed(roomId);

  await getLiveblocks().createFeedMessage({
    roomId,
    feedId: AI_STATUS_FEED_ID,
    data: {
      status: payload.status,
      ...(payload.text === undefined ? {} : { text: payload.text }),
      ...(payload.kind === undefined ? {} : { kind: payload.kind }),
    },
  });
}
