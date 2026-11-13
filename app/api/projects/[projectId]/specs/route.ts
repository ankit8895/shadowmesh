import { jsonError } from "@/lib/api-response";
import { authorizeProjectAccess } from "@/lib/project-access";
import { specFileName } from "@/lib/spec-file";
import { listProjectSpecs } from "@/lib/spec-store";

interface SpecListContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Lists a project's generated specs as metadata only. The Markdown is read
 * through the access-checked download route, so the client never sees a Blob
 * URL. `/api` is exempt from `proxy.ts`, so the route answers with JSON errors
 * itself.
 */
export async function GET(_request: Request, { params }: SpecListContext) {
  const { projectId } = await params;
  const access = await authorizeProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return jsonError(401, "You must be signed in to list specs.");
  }

  if (access.status === "denied") {
    return jsonError(404, "Project not found.");
  }

  try {
    const specs = await listProjectSpecs(projectId);

    return Response.json({
      specs: specs.map((spec) => ({
        id: spec.id,
        createdAt: spec.createdAt,
        filename: specFileName(spec.id),
      })),
    });
  } catch (error) {
    console.error("Unable to list specs.", error);

    return jsonError(500, "Unable to list specs.");
  }
}
