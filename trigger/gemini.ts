import { createGoogle } from "@ai-sdk/google";
import { APICallError, generateText } from "ai";
import { logger } from "@trigger.dev/sdk";

import { geminiApiKey } from "./keys";

/**
 * Google retired `gemini-2.5-flash` for new API keys, so this list is the
 * source of truth for the models the tasks may call. It is ordered
 * newest-first: the first model that answers wins.
 *
 * The newest flash models are also the ones that saturate first, and an
 * overloaded model answers `503` or stalls without replying. That is a capacity
 * problem rather than a bug in the prompt, so a run falls back to the next
 * model instead of failing the whole task.
 */
const MODEL_IDS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;

/** Bounds one model attempt so a stalled response cannot eat the run. */
const ATTEMPT_TIMEOUT_MS = 45_000;

/**
 * Statuses that mean "this model cannot serve the request right now". A `400`
 * or `401` is our own fault (bad prompt or key) and is never retried.
 */
const UNAVAILABLE_STATUSES = new Set([404, 408, 429, 500, 502, 503, 504]);

/** Retirement and transport failures that arrive without a usable status. */
const UNAVAILABLE_MESSAGE =
  /no longer available|not found|is not supported|abort|timed? ?out|fetch failed|ECONNRESET/i;

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * True when the failure is the model being unavailable (retired, overloaded or
 * hung) rather than a prompt or credential error, which fallbacks cannot fix.
 */
function isModelUnavailable(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    if (
      error.statusCode !== undefined &&
      UNAVAILABLE_STATUSES.has(error.statusCode)
    ) {
      return true;
    }

    // Retired models come back as a `400`/`404` mentioning the retirement.
    return UNAVAILABLE_MESSAGE.test(error.message);
  }

  // An exhausted AbortSignal surfaces as a timeout/abort error, and a dropped
  // connection as a fetch failure, neither of which carries a status code.
  return error instanceof Error && UNAVAILABLE_MESSAGE.test(
    `${error.name} ${error.message}`,
  );
}

export interface GeminiTextResult {
  text: string;
  /** The model that answered, which may be a fallback. */
  modelId: string;
}

/**
 * Runs a single-turn text generation against Gemini with a per-model timeout
 * and a fallback chain. The provider is created per call so the key is read
 * from the run's environment and the provider never crosses the worker
 * boundary as serialized state.
 */
export async function generateGeminiText(options: {
  system: string;
  prompt: string;
}): Promise<GeminiTextResult> {
  const failures: string[] = [];

  for (const modelId of MODEL_IDS) {
    try {
      const { text } = await generateText({
        model: createGoogle({ apiKey: geminiApiKey() }).languageModel(modelId),
        system: options.system,
        prompt: options.prompt,
        // The SDK's own retries would re-hit the same overloaded model; the
        // fallback below is the better use of that time.
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });

      return { text, modelId };
    } catch (error) {
      if (!isModelUnavailable(error)) {
        throw error;
      }

      failures.push(`${modelId}: ${errorMessage(error)}`);

      logger.warn("Gemini model unavailable, trying the next one.", {
        modelId,
        error: errorMessage(error),
      });
    }
  }

  throw new Error(
    `Gemini did not answer on any configured model (${MODEL_IDS.join(", ")}). ${failures.join(" | ")}`,
  );
}
