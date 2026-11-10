"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createCanvasSnapshot } from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "error";

const AUTOSAVE_DEBOUNCE_MS = 1200;

/**
 * Serializing the canvas on every change is costly while nodes are dragged, so
 * the dirty check is throttled. The debounce timer still resets on every change
 * and saves the latest snapshot once the room settles.
 */
const DIRTY_CHECK_THROTTLE_MS = 100;

export interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /**
   * Autosave waits until the editor has finished restoring the saved canvas so
   * loading a room never counts as a change. Manual saves are ignored while it
   * is false too, so an early click cannot persist the empty room over the
   * saved canvas.
   */
  enabled: boolean;
  debounceMs?: number;
  onStatusChange?: (status: CanvasSaveStatus) => void;
}

export interface CanvasAutosave {
  status: CanvasSaveStatus;
  /** Saves the current canvas now, cancelling any pending debounce timer. */
  save: () => Promise<void>;
}

/**
 * Watches the room's nodes and edges and saves the canvas through the canvas
 * API after the changes settle. The first snapshot seen once enabled becomes the
 * baseline, so opening, loading or importing initial state is not a save.
 */
export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  debounceMs = AUTOSAVE_DEBOUNCE_MS,
  onStatusChange,
}: UseCanvasAutosaveOptions): CanvasAutosave {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const latest = useRef({ nodes, edges });
  const lastSavedJson = useRef<string | null>(null);
  // A pagehide flush may reach the server without a response we can observe,
  // so it is tracked separately to avoid sending the same body twice.
  const lastFlushedJson = useRef<string | null>(null);
  const hasSaved = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const enabledRef = useRef(enabled);
  const lastDirtyCheckAt = useRef(0);
  // Scheduled retries run after the save function exists; the ref keeps the
  // latest closure without referencing `save` inside its own definition.
  const saveRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    latest.current = { nodes, edges };
  }, [nodes, edges]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  const snapshotJson = useCallback(
    () =>
      JSON.stringify(
        createCanvasSnapshot(latest.current.nodes, latest.current.edges),
      ),
    [],
  );

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const save = useCallback(async () => {
    if (!enabledRef.current || isSaving.current) {
      return;
    }

    clearTimer();

    const json = snapshotJson();

    if (json === lastSavedJson.current) {
      return;
    }

    isSaving.current = true;
    setStatus("saving");

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json,
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      lastSavedJson.current = json;
      lastFlushedJson.current = json;
      hasSaved.current = true;

      // Changes can land while the request is in flight; keep saving until the
      // room matches what was last persisted.
      if (snapshotJson() !== json) {
        setStatus("pending");
        timer.current = setTimeout(() => {
          timer.current = null;
          void saveRef.current();
        }, debounceMs);
      } else {
        setStatus("saved");
      }
    } catch {
      setStatus("error");
    } finally {
      isSaving.current = false;
    }
  }, [clearTimer, debounceMs, projectId, snapshotJson]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const now = Date.now();

    if (now - lastDirtyCheckAt.current >= DIRTY_CHECK_THROTTLE_MS) {
      lastDirtyCheckAt.current = now;

      const json = snapshotJson();

      if (lastSavedJson.current === null) {
        lastSavedJson.current = json;
        lastFlushedJson.current = json;
        return;
      }

      if (json === lastSavedJson.current) {
        // Reverting to the saved state clears a pending indicator without a
        // request; only claim "saved" after a save actually succeeded.
        setStatus((current) =>
          current === "pending" ? (hasSaved.current ? "saved" : "idle") : current,
        );
        return;
      }

      setStatus("pending");
    }

    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      void saveRef.current();
    }, debounceMs);

    return clearTimer;
  }, [nodes, edges, enabled, debounceMs, clearTimer, snapshotJson]);

  // A tab can disappear inside the debounce window, and a client-side route
  // change unmounts this hook. Flush the latest snapshot in both cases. The
  // request is best effort: `keepalive` lets it outlive the page, but browsers
  // drop bodies above their keepalive limit, and a failed flush is retried the
  // next time the project opens only if the room still holds those changes.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const flush = () => {
      if (!enabledRef.current || isSaving.current) {
        return;
      }

      const json = snapshotJson();

      if (json === lastSavedJson.current || json === lastFlushedJson.current) {
        return;
      }

      lastFlushedJson.current = json;

      void fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      }).catch(() => {
        // The page is going away, so a failed flush cannot be surfaced.
      });
    };

    window.addEventListener("pagehide", flush);

    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [enabled, projectId, snapshotJson]);

  return { status, save };
}
