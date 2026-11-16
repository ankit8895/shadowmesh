/**
 * API keys for the AI services used by the design agent.
 *
 * These are read at task runtime (not at import time), so a missing key
 * surfaces as a clear "missing key" error inside the run instead of a
 * cryptic auth failure from the provider.
 */

/**
 * The Gemini key. Local `trigger.dev dev` runs read the project's `.env`, where
 * the key is stored as `GOOGLE_AI_API_KEY`; the two `GEMINI_*` names stay as
 * fallbacks so a key added under either convention keeps working. Deployed
 * workers read whatever is set in the Trigger environment, so the same three
 * names are checked there.
 */
export function geminiApiKey(): string {
  const key =
    process.env.GOOGLE_AI_API_KEY ??
    process.env.GEMINI_AI_API_KEY ??
    process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      "The design agent requires GOOGLE_AI_API_KEY (or GEMINI_AI_API_KEY / GEMINI_API_KEY). Add it to .env for local Trigger runs, or set it on the deployed environment with `npx trigger.dev@latest env set GOOGLE_AI_API_KEY <key> --secret`.",
    );
  }

  return key;
}
