import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { CanvasShape } from "@/types/canvas";

interface NodeShapeProps {
  shape: CanvasShape;
  /** Node fill from `NODE_COLORS`. */
  color: string;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Shapes drawn with CSS borders and radius instead of an SVG. */
const CSS_SHAPES = ["rectangle", "pill", "circle"] as const;

type CssShape = (typeof CSS_SHAPES)[number];

const CSS_SHAPE_RADIUS: Record<CssShape, string> = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};

/** Keeps labels inside the narrower part of each shape. */
const LABEL_INSET: Record<CanvasShape, string> = {
  rectangle: "px-4",
  pill: "px-6",
  circle: "px-5",
  diamond: "px-[22%]",
  hexagon: "px-[16%]",
  cylinder: "px-4",
};

function isCssShape(shape: CanvasShape): shape is CssShape {
  return (CSS_SHAPES as readonly string[]).includes(shape);
}

/**
 * Shape surface shared by canvas nodes and the drag preview. Rectangle, pill
 * and circle are CSS boxes; diamond, hexagon and cylinder are inline SVGs with
 * `preserveAspectRatio="none"` so they follow the node's width and height.
 * Borders stay subtle at rest and switch to the brand accent when selected.
 */
export function NodeShape({
  shape,
  color,
  selected = false,
  className,
  children,
}: NodeShapeProps) {
  const label = children ? (
    <div
      className={cn(
        "relative z-10 flex h-full w-full items-center justify-center text-center",
        LABEL_INSET[shape],
      )}
    >
      {children}
    </div>
  ) : null;

  if (isCssShape(shape)) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border",
          CSS_SHAPE_RADIUS[shape],
          selected ? "border-brand" : "border-subtle-border",
          className,
        )}
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full overflow-visible",
          selected ? "stroke-brand" : "stroke-subtle-border",
        )}
      >
        {shape === "diamond" ? (
          <polygon
            points="50,1 99,50 50,99 1,50"
            fill={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {shape === "hexagon" ? (
          <polygon
            points="25,1 75,1 99,50 75,99 25,99 1,50"
            fill={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {shape === "cylinder" ? (
          <>
            <path
              d="M1 14A49 13 0 0 1 99 14V86a49 13 0 0 1-98 0Z"
              fill={color}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <ellipse
              cx="50"
              cy="14"
              rx="49"
              ry="13"
              fill="none"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>

      {label}
    </div>
  );
}
