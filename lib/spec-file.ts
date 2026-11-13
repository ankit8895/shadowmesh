/**
 * Specs are addressed by project and spec ID. Both the download and the preview
 * text come from the same access-checked download route, so the private Blob
 * URL never reaches the client.
 */
export function specDownloadUrl(projectId: string, specId: string): string {
  return `/api/projects/${encodeURIComponent(projectId)}/specs/${encodeURIComponent(specId)}/download`;
}

/**
 * The attachment name the download route sends; also shown in the specs list.
 * Only a prefix of the ID is used so the name stays readable in the compact
 * sidebar row, where a full UUID would be truncated anyway.
 */
export function specFileName(specId: string): string {
  const shortId = specId.replace(/^run_/, "").slice(0, 8);

  return `shadowmesh-spec-${shortId}.md`;
}

/** Fixed locale keeps the list label stable wherever it is rendered. */
const specTimestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Formats the spec's creation time, tolerating a value `Date` cannot parse. */
export function formatSpecTimestamp(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : specTimestampFormatter.format(date);
}
