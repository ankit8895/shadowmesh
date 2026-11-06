export const UNEXPECTED_ERROR = "Something went wrong. Please try again.";

/** Pulls the `{ error }` message out of an API response, with a generic fallback. */
export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  } catch {
    // Non-JSON error body — fall through to the generic message.
  }

  return UNEXPECTED_ERROR;
}
