import { z } from "zod";

import {
  MAX_ROOM_ID_LENGTH,
  ROOM_ID_PATTERN,
  readJsonObject,
  type ParseResult,
} from "./project-input";

/**
 * Request and task contract for spec generation. The route validates the
 * browser request with `specRequestSchema`, and the Trigger.dev task validates
 * its payload with the same schema plus the server-derived `projectId`, so both
 * sides reject malformed canvas or chat data before a model call is billed.
 *
 * Relative imports keep this module loadable from the Trigger.dev bundle, which
 * does not follow the app's tsconfig path aliases.
 */

/** Caps keep the request, the prompt and the model bill bounded. */
export const MAX_SPEC_CHAT_MESSAGES = 50;
export const MAX_SPEC_NODES = 200;
export const MAX_SPEC_EDGES = 400;

const MAX_LABEL_LENGTH = 200;
const MAX_NODE_ID_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;

const roomIdSchema = z
  .string()
  .trim()
  .min(1, "A room ID is required.")
  .max(MAX_ROOM_ID_LENGTH, "Enter a valid room ID.")
  .regex(ROOM_ID_PATTERN, "Enter a valid room ID.");

/**
 * Only the role and content influence the spec; a message copied from the
 * `ai-chat` feed is accepted and its sender and timestamp are ignored.
 */
export const specChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

/** Canvas nodes only need their identity and label to be described. */
export const specNodeSchema = z.object({
  id: z.string().trim().min(1).max(MAX_NODE_ID_LENGTH),
  data: z
    .object({
      label: z.string().trim().max(MAX_LABEL_LENGTH).optional(),
      shape: z.string().trim().max(40).optional(),
    })
    .optional(),
});

export const specEdgeSchema = z.object({
  id: z.string().trim().min(1).max(MAX_NODE_ID_LENGTH),
  source: z.string().trim().min(1).max(MAX_NODE_ID_LENGTH),
  target: z.string().trim().min(1).max(MAX_NODE_ID_LENGTH),
  data: z
    .object({ label: z.string().trim().max(MAX_LABEL_LENGTH).optional() })
    .optional(),
});

export const specRequestSchema = z.object({
  roomId: roomIdSchema,
  chatHistory: z
    .array(specChatMessageSchema)
    .max(MAX_SPEC_CHAT_MESSAGES)
    .default([]),
  nodes: z.array(specNodeSchema).max(MAX_SPEC_NODES).default([]),
  edges: z.array(specEdgeSchema).max(MAX_SPEC_EDGES).default([]),
});

/**
 * The task receives the room and the server-derived project ID. They are equal
 * because the project ID is the Liveblocks room ID, but access is always
 * resolved from `roomId`, never from a client-supplied project ID.
 */
export const generateSpecPayloadSchema = specRequestSchema
  .extend({ projectId: roomIdSchema })
  .refine((payload) => payload.projectId === payload.roomId, {
    message: "The project ID must match the room ID.",
    path: ["projectId"],
  });

export type SpecChatMessage = z.infer<typeof specChatMessageSchema>;
export type SpecRequest = z.infer<typeof specRequestSchema>;
export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

/** Parses a `POST /api/ai/spec` body into a validated request. */
export async function parseSpecInput(
  request: Request,
): Promise<ParseResult<SpecRequest>> {
  const body = await readJsonObject(request);

  if (!body.ok) {
    return body;
  }

  const parsed = specRequestSchema.safeParse(body.data);

  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "The spec request is invalid.",
    };
  }

  return { ok: true, data: parsed.data };
}
