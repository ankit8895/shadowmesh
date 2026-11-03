import {
  BoxesIcon,
  FileTextIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-animated";
import type { ReactNode } from "react";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: UsersIcon,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileTextIcon,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Two-panel auth shell with a 50/50 split: brand and feature list on the left for large screens,
 * only the Clerk form on small screens.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-svh grid-cols-1 bg-base lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-surface-border bg-teal-dark px-14 py-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground">
            <BoxesIcon size={16} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-copy-primary">
            Shadowmesh
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-copy-primary">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-copy-secondary">
            Describe your architecture in plain English. Shadowmesh maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-dim text-brand">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-copy-primary">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-copy-muted">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">
          © 2026 Shadowmesh. All rights reserved.
        </p>
      </aside>

      <section className="flex items-center justify-center bg-base px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}
