"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { RefreshCwIcon } from "lucide-animated";
import { Component, type ReactNode } from "react";

import { Canvas, type CanvasProps } from "@/components/editor/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/matos-ui/button";

export interface CanvasRoomProps {
  /** The project ID doubles as the Liveblocks room ID. */
  roomId: string;
  template?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  onSaveStatusChange?: CanvasProps["onSaveStatusChange"];
  onReadyChange?: CanvasProps["onReadyChange"];
  saveCanvasRef?: CanvasProps["saveCanvasRef"];
}

/**
 * Opens the Liveblocks room for a project and renders the canvas inside it.
 * The page stays server-side; only this subtree talks to Liveblocks.
 */
export function CanvasRoom({
  roomId,
  template,
  onTemplateImported,
  onSaveStatusChange,
  onReadyChange,
  saveCanvasRef,
}: CanvasRoomProps) {
  return (
    <LiveblocksErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        {/* Switching projects keeps this subtree mounted, but a room can only
            be opened once per provider, so the key forces a fresh connection
            (and a fresh canvas store) when the project changes. */}
        <RoomProvider
          key={roomId}
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas
              projectId={roomId}
              template={template}
              onTemplateImported={onTemplateImported}
              onSaveStatusChange={onSaveStatusChange}
              onReadyChange={onReadyChange}
              saveCanvasRef={saveCanvasRef}
            />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  );
}

function CanvasLoading() {
  return (
    <div
      data-slot="canvas-loading"
      aria-busy="true"
      className="flex h-full w-full items-center justify-center bg-base"
    >
      <p className="text-sm text-copy-muted">Connecting to the room…</p>
    </div>
  );
}

interface CanvasErrorState {
  hasError: boolean;
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Catches the errors Liveblocks throws when authentication or the connection
 * fails. `ClientSideSuspense` only handles loading, so without a boundary a
 * failed handshake would blank the whole workspace.
 */
class LiveblocksErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorState
> {
  state: CanvasErrorState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Liveblocks connection failed.", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <CanvasError onRetry={() => this.setState({ hasError: false })} />
      );
    }

    return this.props.children;
  }
}

function CanvasError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      data-slot="canvas-error"
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-4 bg-base px-6 text-center"
    >
      <div className="flex max-w-sm flex-col items-center gap-2">
        <h2 className="text-base font-semibold tracking-tight text-copy-primary">
          Couldn&apos;t connect to this room
        </h2>
        <p className="text-sm leading-relaxed text-copy-muted">
          The collaboration session for this project could not be opened. Check
          your connection and try again.
        </p>
      </div>

      <Button type="button" variant="secondary" onClick={onRetry}>
        <RefreshCwIcon size={16} aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
