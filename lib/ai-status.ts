import { AI_STATUS_FEED_ID, type AiStatusFeedPayload } from "../types/tasks";
import { getLiveblocks } from "./liveblocks";

/** The presence identity the design agent uses while it works. */
export const AI_USER_ID = "shadowmesh-ai";
export const AI_USER_NAME = "Shadowmesh AI";
export const AI_CURSOR_COLOR = "#6457f9";

/**
 * Liveblocks reports an existing feed as `FEED_ALREADY_EXISTS` on the room
 * socket; the REST clients use a 409 status for the same conflict.
 */
function isFeedAlreadyExistsError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const { status, context } = error as {
    status?: unknown;
    context?: { code?: unknown };
  };

  return status === 409 || context?.code === "FEED_ALREADY_EXISTS";
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
