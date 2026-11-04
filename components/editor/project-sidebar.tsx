"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlusIcon, XIcon } from "lucide-animated";
import { useMemo } from "react";

import { Button } from "@/components/matos-ui/button";
import { MotionTabs } from "@/components/matos-ui/motion-tabs";
import { ProjectList } from "@/components/editor/project-list";
import type { Project } from "@/lib/mock-projects";
import { spring, withReducedMotion } from "@/lib/motion-tokens";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

const sidebarVariants = {
  hidden: { x: "-110%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring.moderate },
  exit: { x: "-110%", opacity: 0, transition: spring.moderate.exit },
};

const scrimVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: spring.fast },
  exit: { opacity: 0, transition: spring.fast.exit },
};

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? withReducedMotion(sidebarVariants)
    : sidebarVariants;
  const scrim = shouldReduceMotion ? withReducedMotion(scrimVariants) : scrimVariants;

  const ownedProjects = useMemo(
    () => projects.filter((project) => project.isOwner),
    [projects],
  );
  const sharedProjects = useMemo(
    () => projects.filter((project) => !project.isOwner),
    [projects],
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Mobile only: tapping outside the sidebar dismisses it. */}
          <motion.div
            key="project-sidebar-scrim"
            data-slot="project-sidebar-scrim"
            aria-hidden="true"
            variants={scrim}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-20 bg-base/60 backdrop-blur-[1px] lg:hidden"
          />

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
              <h2 className="text-sm font-semibold text-copy-primary">
                Projects
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close projects sidebar"
                onClick={onClose}
              >
                <XIcon size={16} aria-hidden="true" />
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
                      <ProjectList
                        projects={ownedProjects}
                        emptyTitle="No projects yet"
                        emptyDescription="Create a project to start designing your system."
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                      />
                    ),
                  },
                  {
                    value: "shared",
                    label: "Shared",
                    content: (
                      <ProjectList
                        projects={sharedProjects}
                        emptyTitle="No shared projects"
                        emptyDescription="Projects shared with you will appear here."
                      />
                    ),
                  },
                ]}
              />
            </div>

            <div className="shrink-0 border-t border-surface-border p-3">
              <Button
                type="button"
                className="w-full"
                onClick={onCreateProject}
              >
                <PlusIcon size={16} aria-hidden="true" />
                New Project
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
