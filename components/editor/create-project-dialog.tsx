"use client";

import { Button } from "@/components/matos-ui/button";
import { InputField } from "@/components/matos-ui/input";
import {
  StackedDialog,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogFooter,
  StackedDialogHeader,
  StackedDialogTitle,
} from "@/components/matos-ui/stacked-dialog";

export interface CreateProjectDialogProps {
  open: boolean;
  name: string;
  slug: string;
  isSubmitting: boolean;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  name,
  slug,
  isSubmitting,
  onNameChange,
  onOpenChange,
  onSubmit,
}: CreateProjectDialogProps) {
  // A name made only of symbols slugifies to an empty string, which would
  // create a project with no URL-friendly identifier.
  const trimmedName = name.trim();
  const slugError =
    trimmedName.length > 0 && slug.length === 0
      ? "Use at least one letter or number in the project name."
      : undefined;

  return (
    <StackedDialog open={open} onOpenChange={onOpenChange}>
      <StackedDialogContent>
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <StackedDialogHeader>
            <StackedDialogTitle>New Project</StackedDialogTitle>
            <StackedDialogDescription>
              Give your system a name to get started.
            </StackedDialogDescription>
          </StackedDialogHeader>

          <div className="mt-4 flex flex-col gap-1.5">
            <InputField
              label="Project name"
              placeholder="Payments Platform"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
              required
              error={slugError}
              reserveMessageSpace={false}
            />
            <p
              data-slot="slug-preview"
              className="truncate text-xs text-copy-muted"
            >
              Slug:{" "}
              <span className="text-copy-secondary">
                {slug || "your-project"}
              </span>
            </p>
          </div>

          <StackedDialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmedName || Boolean(slugError)}
              loading={isSubmitting}
            >
              Create project
            </Button>
          </StackedDialogFooter>
        </form>
      </StackedDialogContent>
    </StackedDialog>
  );
}
