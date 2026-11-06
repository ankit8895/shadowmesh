export const DEFAULT_PROJECT_NAME = "Untitled Project";

const MAX_ROOM_ID_LENGTH = 64;
const ROOM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface CreateProjectInput {
  name: string;
  description: string | null;
  roomId: string | null;
}

export interface RenameProjectInput {
  name: string;
}

export interface InviteCollaboratorInput {
  email: string;
}

// Deliberately loose: the address is only an invitation key, not an account.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function readJsonObject(
  request: Request,
): Promise<ParseResult<Record<string, unknown>>> {
  let raw: string;

  try {
    raw = await request.text();
  } catch {
    return { ok: false, error: "Unable to read the request body." };
  }

  if (raw.trim() === "") {
    return { ok: true, data: {} };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  return { ok: true, data: parsed as Record<string, unknown> };
}

/**
 * A missing, null or blank name falls back to `Untitled Project`; a blank
 * description is stored as `null`.
 */
export async function parseCreateProjectInput(
  request: Request,
): Promise<ParseResult<CreateProjectInput>> {
  const body = await readJsonObject(request);

  if (!body.ok) {
    return body;
  }

  const { name, description, roomId } = body.data;

  if (name !== undefined && name !== null && typeof name !== "string") {
    return { ok: false, error: "Project name must be a string." };
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return { ok: false, error: "Project description must be a string." };
  }

  if (
    roomId !== undefined &&
    roomId !== null &&
    typeof roomId !== "string"
  ) {
    return { ok: false, error: "Room ID must be a string." };
  }

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";
  const trimmedRoomId = typeof roomId === "string" ? roomId.trim() : "";

  if (
    trimmedRoomId !== "" &&
    (trimmedRoomId.length > MAX_ROOM_ID_LENGTH ||
      !ROOM_ID_PATTERN.test(trimmedRoomId))
  ) {
    return {
      ok: false,
      error:
        "Room ID can only contain lowercase letters, numbers and single hyphens.",
    };
  }

  return {
    ok: true,
    data: {
      name: trimmedName === "" ? DEFAULT_PROJECT_NAME : trimmedName,
      description: trimmedDescription === "" ? null : trimmedDescription,
      roomId: trimmedRoomId === "" ? null : trimmedRoomId,
    },
  };
}

export async function parseInviteCollaboratorInput(
  request: Request,
): Promise<ParseResult<InviteCollaboratorInput>> {
  const body = await readJsonObject(request);

  if (!body.ok) {
    return body;
  }

  const { email } = body.data;

  if (typeof email !== "string" || email.trim() === "") {
    return { ok: false, error: "An email address is required." };
  }

  // Stored lowercased so the unique `projectId` / `email` pair cannot be
  // bypassed by capitalization and matching stays predictable.
  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(normalizedEmail)
  ) {
    return { ok: false, error: "Enter a valid email address." };
  }

  return { ok: true, data: { email: normalizedEmail } };
}

export async function parseRenameProjectInput(
  request: Request,
): Promise<ParseResult<RenameProjectInput>> {
  const body = await readJsonObject(request);

  if (!body.ok) {
    return body;
  }

  const { name } = body.data;

  if (typeof name !== "string" || name.trim() === "") {
    return { ok: false, error: "A project name is required." };
  }

  return { ok: true, data: { name: name.trim() } };
}
