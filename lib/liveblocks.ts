import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");
  }

  return new Liveblocks({ secret });
}

/**
 * Returns the node client, creating it on first use. The client only holds the
 * secret and base URL, so one instance is cached on `globalThis` and reused by
 * every request and hot reload. Construction is deferred instead of running at
 * import time so a build without the secret still succeeds.
 */
export function getLiveblocks(): Liveblocks {
  const cached = globalForLiveblocks.liveblocks;

  if (cached) {
    return cached;
  }

  const client = createLiveblocksClient();
  globalForLiveblocks.liveblocks = client;

  return client;
}
