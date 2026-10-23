"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FolderOpen, Plus, X } from "lucide-react";

import { Button } from "@/components/matos-ui/button";
import { MotionTabs } from "@/components/matos-ui/motion-tabs";
import { spring, withReducedMotion } from "@/lib/motion-tokens";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarVariants = {
  hidden: { x: "-110%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring.moderate },
  exit: { x: "-110%", opacity: 0, transition: spring.moderate.exit },
};

interface ProjectsEmptyStateProps {
  title: string;
  description: string;
}

function ProjectsEmptyState({ title, description }: ProjectsEmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
      <FolderOpen className="size-8 text-copy-faint" aria-hidden="true" />
      <p className="text-sm font-medium text-copy-secondary">{title}</p>
      <p className="max-w-56 text-xs leading-relaxed text-copy-muted">
        {description}
      </p>
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? withReducedMotion(sidebarVariants)
    : sidebarVariants;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="project-sidebar"
          id="project-sidebar"
          data-slot="project-sidebar"
          aria-label="Projects"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-[4.5rem] bottom-3 left-3 z-30 flex w-80 flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-surface-6 backdrop-blur-xl"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-surface-border px-4">
            <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close projects sidebar"
              onClick={onClose}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <MotionTabs
              size="sm"
              className="w-full"
              items={[
                {
                  value: "my-projects",
                  label: "My Projects",
                  content: (
                    <ProjectsEmptyState
                      title="No projects yet"
                      description="Create a project to start designing your system."
                    />
                  ),
                },
                {
                  value: "shared",
                  label: "Shared",
                  content: (
                    <ProjectsEmptyState
                      title="No shared projects"
                      description="Projects shared with you will appear here."
                    />
                  ),
                },
              ]}
            />
          </div>

          <div className="shrink-0 border-t border-surface-border p-3">
            <Button type="button" className="w-full">
              <Plus className="size-4" aria-hidden="true" />
              New Project
            </Button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
