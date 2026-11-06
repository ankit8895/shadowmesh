"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SparklesIcon, XIcon } from "lucide-animated";

import { Button } from "@/components/matos-ui/button";
import { spring, withReducedMotion } from "@/lib/motion-tokens";

export interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarVariants = {
  hidden: { x: "110%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring.moderate },
  exit: { x: "110%", opacity: 0, transition: spring.moderate.exit },
};

/**
 * Placeholder for the AI chat panel. It mirrors the project sidebar's floating
 * overlay, but slides in from the right; the chat itself lands with a later
 * feature.
 */
export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? withReducedMotion(sidebarVariants)
    : sidebarVariants;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="ai-sidebar"
          id="ai-sidebar"
          data-slot="ai-sidebar"
          aria-label="AI assistant"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-[4.5rem] right-3 bottom-3 z-30 flex w-80 flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-surface-6 backdrop-blur-xl"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-surface-border px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-brand">
                <SparklesIcon size={16} aria-hidden="true" />
              </span>
              <h2 className="truncate text-sm font-semibold text-copy-primary">
                AI Assistant
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close AI sidebar"
              onClick={onClose}
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <SparklesIcon size={32} className="text-copy-faint" aria-hidden="true" />
            <p className="text-sm font-medium text-copy-secondary">
              Chat is coming soon
            </p>
            <p className="max-w-56 text-xs leading-relaxed text-copy-muted">
              Describe your architecture and AI will map it onto the canvas.
            </p>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
