"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Writes an edge label through the room's synced edge state. */
export type UpdateEdgeLabel = (id: string, label: string) => void;

const CanvasEdgeActionsContext = createContext<UpdateEdgeLabel | null>(null);

interface CanvasEdgeActionsProviderProps {
  updateEdgeLabel: UpdateEdgeLabel;
  children: ReactNode;
}

/**
 * Exposes canvas-level edge actions to custom edge renderers, which React Flow
 * mounts outside the component that owns the synced edge state.
 */
export function CanvasEdgeActionsProvider({
  updateEdgeLabel,
  children,
}: CanvasEdgeActionsProviderProps) {
  return (
    <CanvasEdgeActionsContext.Provider value={updateEdgeLabel}>
      {children}
    </CanvasEdgeActionsContext.Provider>
  );
}

export function useUpdateEdgeLabel(): UpdateEdgeLabel {
  const updateEdgeLabel = useContext(CanvasEdgeActionsContext);

  if (!updateEdgeLabel) {
    throw new Error(
      "useUpdateEdgeLabel must be used inside CanvasEdgeActionsProvider.",
    );
  }

  return updateEdgeLabel;
}
