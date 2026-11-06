import { jsonError } from "@/lib/api-response";
import { getCursorColor } from "@/lib/cursor-color";
import { getLiveblocks } from "@/lib/liveblocks";
import { authorizeProjectAccess } from "@/lib/project-access";
import { parseLiveblocksAuthInput } from "@/lib/project-input";

/**
 * Issues a Liveblocks session token for one room. The project ID is the room ID,
 * so the caller must own or collaborate on that project before a room is
 * created or a token is issued.
 */
export async function POST(request: Request) {
  const input = await parseLiveblocksAuthInput(request);

  if (!input.ok) {
    return jsonError(400, input.error);
  }

  const access = await authorizeProjectAccess(input.data.room);

  if (access.status === "unauthenticated") {
    return jsonError(401, "Unauthorized.");
  }

  if (access.status === "denied") {
    // Missing projects answer 403 too, so room IDs cannot be probed for
    // existence by an authenticated user.
    return jsonError(403, "You do not have access to this project.");
  }

  try {
    const liveblocks = getLiveblocks();

    // Idempotent: an existing room is returned untouched, so this creates the
    // room only the first time a verified member joins it.
    await liveblocks.getOrCreateRoom(input.data.room, { defaultAccesses: [] });

    const session = liveblocks.prepareSession(access.viewer.userId, {
      userInfo: {
        name: access.viewer.name,
        avatar: access.viewer.avatar ?? "",
        cursorColor: getCursorColor(access.viewer.userId),
      },
    });

    // Write access is scoped to this one room; the room has no default access.
    session.allow(input.data.room, ["*:write"]);

    const { status, body } = await session.authorize();

    return new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unable to create a Liveblocks session.", error);

    return jsonError(500, "Unable to start a Liveblocks session.");
  }
}
