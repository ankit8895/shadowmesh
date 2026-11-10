"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useViewport, ViewportPortal } from "@xyflow/react";

/**
 * Renders other participants' cursors inside React Flow's viewport. Cursor
 * coordinates are stored in canvas space, so the portal keeps them aligned
 * while panning and zooming; the inverse zoom keeps the pointer a constant
 * screen size.
 */
export function PresenceCursors() {
  const others = useOthers();
  const { zoom } = useViewport();
  const cursors = others.filter((other) => other.presence.cursor !== null);

  if (cursors.length === 0) {
    return null;
  }

  const inverseZoom = 1 / (zoom || 1);

  return (
    <ViewportPortal>
      {cursors.map((other) => {
        const cursor = other.presence.cursor;

        if (!cursor) {
          return null;
        }

        const name = other.info.name.trim() || "Collaborator";
        const color = other.info.cursorColor || "var(--accent-primary)";

        return (
          <div
            key={other.connectionId}
            data-slot="presence-cursor"
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-50 select-none"
            style={{
              transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${inverseZoom})`,
              transformOrigin: "top left",
            }}
          >
            <svg
              width="18"
              height="20"
              viewBox="0 0 18 20"
              fill="none"
              className="drop-shadow-sm"
            >
              <path
                d="M0.5 0.5V17.5L5.6 12.7L8.4 19L11.5 17.6L8.8 11.5H15.5L0.5 0.5Z"
                fill={color}
                stroke="var(--bg-base)"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>

            <span
              className="absolute top-4 left-4 max-w-40 truncate rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap shadow-surface-2"
              style={{
                backgroundColor: color,
                color: "var(--bg-base)",
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </ViewportPortal>
  );
}
