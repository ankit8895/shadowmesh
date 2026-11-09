"use client";

import { Button } from "@/components/matos-ui/button";
import {
  StackedDialog,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogHeader,
  StackedDialogTitle,
} from "@/components/matos-ui/stacked-dialog";
import { NodeShape } from "@/components/editor/node-shape";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { ScrollArea } from "@/components/ui/scroll-area";

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 132;
const PREVIEW_PADDING = 12;

const FALLBACK_NODE_WIDTH = 160;
const FALLBACK_NODE_HEIGHT = 100;

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

/** Dialog with one card per predefined template; importing replaces the canvas. */
export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <StackedDialog open={open} onOpenChange={onOpenChange}>
      <StackedDialogContent className="max-w-3xl">
        <StackedDialogHeader>
          <StackedDialogTitle>Starter templates</StackedDialogTitle>
          <StackedDialogDescription>
            Start from a pre-built diagram. Importing one replaces everything
            currently on the canvas.
          </StackedDialogDescription>
        </StackedDialogHeader>

        <ScrollArea className="mt-4 h-[min(55vh,420px)] pr-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {CANVAS_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-base/40 p-3"
              >
                <TemplatePreview template={template} />

                <div className="flex flex-1 flex-col gap-1">
                  <h3 className="text-sm font-medium text-copy-primary">
                    {template.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-copy-muted">
                    {template.description}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => handleImport(template)}
                >
                  Import
                </Button>
              </article>
            ))}
          </div>
        </ScrollArea>
      </StackedDialogContent>
    </StackedDialog>
  );
}

interface TemplateBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/** Bounds around every node, including its size, in canvas coordinates. */
function getTemplateBounds(template: CanvasTemplate): TemplateBounds {
  if (template.nodes.length === 0) {
    return { minX: 0, minY: 0, width: 1, height: 1 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of template.nodes) {
    const width = node.width ?? FALLBACK_NODE_WIDTH;
    const height = node.height ?? FALLBACK_NODE_HEIGHT;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  }

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

/**
 * Lightweight preview: nodes render through the shared `NodeShape` and edges
 * are plain lines between node centres, all scaled to fit a fixed viewport.
 */
function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = getTemplateBounds(template);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height,
  );
  const offsetX = (PREVIEW_WIDTH - bounds.width * scale) / 2;
  const offsetY = (PREVIEW_HEIGHT - bounds.height * scale) / 2;
  const nodesById = new Map(template.nodes.map((node) => [node.id, node]));

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto overflow-hidden rounded-xl border border-surface-border/60 bg-base"
      style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: bounds.width,
          height: bounds.height,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        }}
      >
        <svg
          width={bounds.width}
          height={bounds.height}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {template.edges.map((edge) => {
            const source = nodesById.get(edge.source);
            const target = nodesById.get(edge.target);

            if (!source || !target) {
              return null;
            }

            const sourceX =
              source.position.x -
              bounds.minX +
              (source.width ?? FALLBACK_NODE_WIDTH) / 2;
            const sourceY =
              source.position.y -
              bounds.minY +
              (source.height ?? FALLBACK_NODE_HEIGHT) / 2;
            const targetX =
              target.position.x -
              bounds.minX +
              (target.width ?? FALLBACK_NODE_WIDTH) / 2;
            const targetY =
              target.position.y -
              bounds.minY +
              (target.height ?? FALLBACK_NODE_HEIGHT) / 2;

            return (
              <line
                key={edge.id}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {template.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.position.x - bounds.minX,
              top: node.position.y - bounds.minY,
              width: node.width ?? FALLBACK_NODE_WIDTH,
              height: node.height ?? FALLBACK_NODE_HEIGHT,
            }}
          >
            <NodeShape shape={node.data.shape} color={node.data.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
