import { jsonError } from "@/lib/api-response";
import { authorizeProjectAccess } from "@/lib/project-access";
import { specFileName } from "@/lib/spec-file";
import { findProjectSpec, readProjectSpecFile } from "@/lib/spec-store";

interface SpecDownloadContext {
  params: Promise<{ projectId: string; specId: string }>;
}

/**
 * Streams a saved spec back as a Markdown attachment. `/api` is exempt from
 * `proxy.ts`, so the route authenticates and answers with JSON errors itself.
 *
 * The Blob URL never leaves the server: the spec is looked up by project *and*
 * spec ID, so a spec from another project cannot be downloaded through a
 * project the caller can access.
 */
export async function GET(
  _request: Request,
  { params }: SpecDownloadContext,
) {
  const { projectId, specId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to download a spec.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  try {
    const spec = await findProjectSpec(projectId, specId);

    if (!spec) {
      return jsonError(404, "Spec not found.");
    }

    const stream = await readProjectSpecFile(spec.filePath);

    if (!stream) {
      return jsonError(404, "Spec file not found.");
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${specFileName(spec.id)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Unable to download the spec.", error);

    return jsonError(500, "Unable to download the spec.");
  }
}
