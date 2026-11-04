export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
}

/**
 * Placeholder workspace data until project persistence lands. `isOwner` decides
 * whether the sidebar exposes rename and delete actions for a project.
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "project-payments",
    name: "Payments Platform",
    slug: "payments-platform",
    isOwner: true,
  },
  {
    id: "project-notifications",
    name: "Realtime Notifications",
    slug: "realtime-notifications",
    isOwner: true,
  },
  {
    id: "project-checkout",
    name: "Checkout Rewrite",
    slug: "checkout-rewrite",
    isOwner: false,
  },
];
