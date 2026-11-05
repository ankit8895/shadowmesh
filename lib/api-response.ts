/** Builds the single error shape every project API route returns. */
export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}
