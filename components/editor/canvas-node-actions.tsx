"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CanvasNodeData } from "@/types/canvas";

/** Writes a partial node data patch through the room's synced node state. */
export type UpdateNodeData = (id: string, data: Partial<CanvasNodeData>) => void;

const CanvasNodeActionsContext = createContext<UpdateNodeData | null>(null);

interface CanvasNodeActionsProviderProps {
  updateNodeData: UpdateNodeData;
  children: ReactNode;
}

/**
 * Exposes canvas-level node actions to custom node renderers, which React Flow
 * mounts outside the component that owns the synced node state.
 */
export function CanvasNodeActionsProvider({
  updateNodeData,
  children,
}: CanvasNodeActionsProviderProps) {
  return (
    <CanvasNodeActionsContext.Provider value={updateNodeData}>
      {children}
    </CanvasNodeActionsContext.Provider>
  );
}

export function useUpdateNodeData(): UpdateNodeData {
  const updateNodeData = useContext(CanvasNodeActionsContext);

  if (!updateNodeData) {
    throw new Error(
      "useUpdateNodeData must be used inside CanvasNodeActionsProvider.",
    );
  }

  return updateNodeData;
}
