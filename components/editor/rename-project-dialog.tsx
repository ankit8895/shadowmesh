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
  isSubmitting: boolean;
  error?: string | null;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  projectName,
  name,
  isSubmitting,
  error,
  onNameChange,
  onOpenChange,
  onSubmit,
}: RenameProjectDialogProps) {
  // Renaming does not change the room ID, so only a blank name is invalid.
  const trimmedName = name.trim();

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

          <div className="mt-4 flex flex-col gap-1.5">
            <InputField
              label="Project name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
              required
              reserveMessageSpace={false}
            />
            {error ? (
              <p role="alert" className="text-xs text-error">
                {error}
              </p>
            ) : null}
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
              disabled={!trimmedName}
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
