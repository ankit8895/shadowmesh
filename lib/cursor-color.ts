/**
 * Fixed palette for collaborator cursors and carets. Every color is chosen to
 * stay legible on the dark canvas in `context/ui-context.md`.
 */
export const CURSOR_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#fb923c",
  "#e879f9",
] as const;

/**
 * Maps a user ID to a palette color. The hash is stable across requests,
 * rooms and reloads, so a user keeps one cursor color without storing it.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length] ?? CURSOR_COLORS[0];
}
