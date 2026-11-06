export type ProjectStatus = "DRAFT" | "ARCHIVED";

/** The project fields returned by the project API and rendered by the editor. */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  canvasJsonPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A collaborator as rendered in the share dialog. The email is the stored
 * invitation; the name and avatar come from Clerk when that email belongs to a
 * user, and stay `null` otherwise.
 */
export interface CollaboratorView {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}
