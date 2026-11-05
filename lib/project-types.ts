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
