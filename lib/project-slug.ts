const MAX_SLUG_LENGTH = 48;

/**
 * Derives the slug that starts a new project's room ID. Names are reduced to
 * lowercase alphanumeric segments joined with single hyphens.
 */
export function toProjectSlug(name: string): string {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}
