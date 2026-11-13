import { randomUUID } from "node:crypto";

import { get, put } from "@vercel/blob";

import { prisma } from "./prisma";

/**
 * Spec content lives in the private Blob store; Prisma only holds the metadata
 * row and the blob URL. Reads and writes authenticate with the server token
 * instead of relying on the blob being publicly readable.
 *
 * Relative imports keep this module loadable from the Trigger.dev bundle, which
 * does not follow the app's tsconfig path aliases.
 */
const BLOB_ACCESS = "private" as const;

/**
 * Each generation gets an immutable blob named after its metadata row, so a
 * later run never overwrites an earlier spec.
 */
export function specBlobPath(projectId: string, specId: string): string {
  return `specs/${projectId}/${specId}.md`;
}

export interface SavedProjectSpec {
  id: string;
  filePath: string;
}

/**
 * Uploads the Markdown to Blob and records its metadata row for the project.
 * The upload happens first so a failed write never leaves a row pointing at a
 * missing file.
 */
export async function saveProjectSpec(
  projectId: string,
  markdown: string,
  specId: string = randomUUID(),
): Promise<SavedProjectSpec> {
  // A retried run passes its own run ID, so the blob path and the metadata row
  // stay single even when an attempt is retried after the write succeeded. The
  // run owns the path, so overwriting it is safe and keeps one spec per run.
  const blob = await put(specBlobPath(projectId, specId), markdown, {
    access: BLOB_ACCESS,
    contentType: "text/markdown; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return prisma.projectSpec.upsert({
    where: { id: specId },
    create: { id: specId, projectId, filePath: blob.url },
    update: { filePath: blob.url },
    select: { id: true, filePath: true },
  });
}

/**
 * Lists a project's saved specs, newest first. Only metadata is read: the
 * Markdown itself is fetched through the access-checked download route.
 */
const MAX_PROJECT_SPECS = 50;

export function listProjectSpecs(projectId: string) {
  return prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: MAX_PROJECT_SPECS,
    select: { id: true, createdAt: true },
  });
}

/** Finds a spec only when it belongs to the named project. */
export function findProjectSpec(projectId: string, specId: string) {
  return prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
    select: { id: true, filePath: true, createdAt: true },
  });
}

/**
 * Streams a private spec blob back, or returns `null` when it no longer exists.
 * Callers must check project access before reading the file.
 */
export async function readProjectSpecFile(
  filePath: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const result = await get(filePath, {
    access: BLOB_ACCESS,
    // Always read the stored file instead of a cached CDN copy.
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  return result.stream;
}
