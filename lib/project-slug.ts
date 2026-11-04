const MAX_SLUG_LENGTH = 48;

/**
 * Derives the project slug previewed in the create dialog. Names are reduced to
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
