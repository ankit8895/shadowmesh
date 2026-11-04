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

export interface RenameProjectDialogProps {
  open: boolean;
  projectName: string;
  name: string;
  slug: string;
  isSubmitting: boolean;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  projectName,
  name,
  slug,
  isSubmitting,
  onNameChange,
  onOpenChange,
  onSubmit,
}: RenameProjectDialogProps) {
  // A name made only of symbols slugifies to an empty string, which would
  // leave the project without a URL-friendly identifier.
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
            <StackedDialogTitle>Rename Project</StackedDialogTitle>
            <StackedDialogDescription>
              Currently named “{projectName}”.
            </StackedDialogDescription>
          </StackedDialogHeader>

          <div className="mt-4">
            <InputField
              label="Project name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
              required
              error={slugError}
              reserveMessageSpace={false}
            />
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
              Save changes
            </Button>
          </StackedDialogFooter>
        </form>
      </StackedDialogContent>
    </StackedDialog>
  );
}
