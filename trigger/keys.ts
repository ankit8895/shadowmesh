/**
 * API keys for the AI services used by the design agent.
 *
 * These are read at task runtime (not at import time), so a missing key
 * surfaces as a clear "missing key" error inside the run instead of a
 * cryptic auth failure from the provider.
 */
export function geminiApiKey(): string {
  const key = process.env.GEMINI_AI_API_KEY ?? process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      "The design agent requires GEMINI_AI_API_KEY (or GEMINI_API_KEY) in the Trigger secrets. Set it with `npx trigger.dev@latest env add GEMINI_AI_API_KEY`.",
    );
  }

  return key;
}
