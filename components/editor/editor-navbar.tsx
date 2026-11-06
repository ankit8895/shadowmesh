"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-animated";
import type { ReactNode } from "react";

import { Button } from "@/components/matos-ui/button";

export interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** Shown in the centre of the bar; omitted on the project home. */
  title?: string;
  /** Extra actions rendered next to the user menu. */
  actions?: ReactNode;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  title,
  actions,
}: EditorNavbarProps) {
  return (
    <header
      data-slot="editor-navbar"
      className="flex h-14 shrink-0 items-center gap-4 border-b border-surface-border bg-surface px-3"
    >
      <div className="flex flex-1 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"
          }
          aria-expanded={isSidebarOpen}
          aria-controls="project-sidebar"
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <PanelLeftCloseIcon size={20} aria-hidden="true" />
          ) : (
            <PanelLeftOpenIcon size={20} aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        {title ? (
          <p
            data-slot="editor-navbar-title"
            className="min-w-0 truncate text-sm font-medium text-copy-primary"
          >
            {title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        {actions}
        <UserButton />
      </div>
    </header>
  );
}
