import { get, put } from "@vercel/blob";

import {
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";
import { prisma } from "@/lib/prisma";

/**
 * The Blob store is private, so both writes and reads authenticate with the
 * server-side token instead of relying on the blob URL being publicly readable.
 */
const BLOB_ACCESS = "private" as const;

/** Every project's canvas lives at a stable path so saves overwrite in place. */
export function canvasBlobPath(projectId: string): string {
  return `canvas/${projectId}.json`;
}

/**
 * Uploads the canvas JSON to Vercel Blob and points the project record at the
 * blob URL. Prisma only ever holds metadata; the JSON stays in Blob.
 */
export async function saveProjectCanvas(
  projectId: string,
  snapshot: CanvasSnapshot,
): Promise<void> {
  const blob = await put(canvasBlobPath(projectId), JSON.stringify(snapshot), {
    access: BLOB_ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  // Overwriting a stable path returns the same URL, so autosaves normally do
  // not need to touch the metadata row at all.
  await prisma.project.updateMany({
    where: {
      id: projectId,
      OR: [{ canvasJsonPath: null }, { canvasJsonPath: { not: blob.url } }],
    },
    data: { canvasJsonPath: blob.url },
  });
}

/**
 * Reads the project's saved blob URL and returns the canvas JSON, or `null`
 * when the project has never been saved.
 */
export async function loadProjectCanvas(
  projectId: string,
): Promise<CanvasSnapshot | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!project?.canvasJsonPath) {
    return null;
  }

  const result = await get(project.canvasJsonPath, {
    access: BLOB_ACCESS,
    // Always read the latest save instead of a cached CDN copy.
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    throw new Error("Unable to read the saved canvas from Vercel Blob.");
  }

  const parsed = parseCanvasSnapshot(await new Response(result.stream).json());

  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  return parsed.data;
}
