"use client";

import { Button } from "@/components/matos-ui/button";
import {
  StackedDialog,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogFooter,
  StackedDialogHeader,
  StackedDialogTitle,
} from "@/components/matos-ui/stacked-dialog";

export interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProjectDialog({
  open,
  projectName,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <StackedDialog open={open} onOpenChange={onOpenChange}>
      <StackedDialogContent variant="danger">
        <StackedDialogHeader>
          <StackedDialogTitle>Delete Project</StackedDialogTitle>
          <StackedDialogDescription>
            “{projectName}” will be removed along with its canvas. This cannot
            be undone.
          </StackedDialogDescription>
        </StackedDialogHeader>

        <StackedDialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSubmitting}
            onClick={onConfirm}
          >
            Delete project
          </Button>
        </StackedDialogFooter>
      </StackedDialogContent>
    </StackedDialog>
  );
}
