import {
  MAX_ROOM_ID_LENGTH,
  ROOM_ID_PATTERN,
  readJsonObject,
  type ParseResult,
} from "@/lib/project-input";

const MAX_PROMPT_LENGTH = 2000;

export interface DesignInput {
  prompt: string;
  projectId: string;
  roomId: string;
}

/**
 * The design request carries both IDs because the task writes into a Liveblocks
 * room, but the project ID *is* the room ID. Requiring them to match keeps the
 * run from targeting a room the caller was not authorized for.
 */
export async function parseDesignInput(
  request: Request,
): Promise<ParseResult<DesignInput>> {
  const body = await readJsonObject(request);

  if (!body.ok) {
    return body;
  }

  const { prompt, projectId, roomId } = body.data;

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return { ok: false, error: "A design prompt is required." };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return {
      ok: false,
      error: `The design prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
    };
  }

  if (typeof projectId !== "string" || projectId.trim() === "") {
    return { ok: false, error: "A project ID is required." };
  }

  if (typeof roomId !== "string" || roomId.trim() === "") {
    return { ok: false, error: "A room ID is required." };
  }

  const trimmedProjectId = projectId.trim();
  const trimmedRoomId = roomId.trim();

  if (
    trimmedProjectId.length > MAX_ROOM_ID_LENGTH ||
    !ROOM_ID_PATTERN.test(trimmedProjectId)
  ) {
    return { ok: false, error: "Enter a valid project ID." };
  }

  if (
    trimmedRoomId.length > MAX_ROOM_ID_LENGTH ||
    !ROOM_ID_PATTERN.test(trimmedRoomId)
  ) {
    return { ok: false, error: "Enter a valid room ID." };
  }

  if (trimmedRoomId !== trimmedProjectId) {
    return { ok: false, error: "The room ID must match the project ID." };
  }

  return {
    ok: true,
    data: {
      prompt: trimmedPrompt,
      projectId: trimmedProjectId,
      roomId: trimmedRoomId,
    },
  };
}
