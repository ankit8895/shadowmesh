"use client";

import type { ReactFlowInstance } from "@xyflow/react";
import { useEffect } from "react";

interface UseKeyboardShortcutsOptions {
  reactFlow: ReactFlowInstance;
  undo: () => void;
  redo: () => void;
}

const ZOOM_DURATION = 200;

/** Inputs, textareas and editable text fields keep their own key handling. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/**
 * Binds canvas shortcuts on `window`: `+` / `=` to zoom in, `-` to zoom out,
 * `Cmd/Ctrl+Z` to undo, `Cmd/Ctrl+Shift+Z` and `Cmd/Ctrl+Y` to redo. Modified
 * zoom keys are left to the browser, and typing in an editable field is ignored
 * so labels and form inputs behave normally.
 */
export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifier && key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (modifier && key === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (modifier || event.altKey) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: ZOOM_DURATION });
      } else if (event.key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: ZOOM_DURATION });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, undo, redo]);
}
