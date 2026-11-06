"use client";

import { CheckIcon, CopyIcon, DeleteIcon, UserIcon } from "lucide-animated";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/matos-ui/button";
import { Input, InputField } from "@/components/matos-ui/input";
import {
  StackedDialog,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogHeader,
  StackedDialogTitle,
} from "@/components/matos-ui/stacked-dialog";
import { useCollaborators } from "@/hooks/use-collaborators";
import type { CollaboratorView } from "@/lib/project-types";

/** How long the copy button keeps its `Copied!` confirmation. */
const COPIED_FEEDBACK_MS = 2000;

export interface ShareProjectDialogProps {
  open: boolean;
  projectId: string;
  projectName: string;
  /** Owners manage access; collaborators only see who else has it. */
  isOwner: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareProjectDialog({
  open,
  projectId,
  projectName,
  isOwner,
  onOpenChange,
}: ShareProjectDialogProps) {
  const {
    collaborators,
    hasLoaded,
    isLoading,
    error,
    isInviting,
    removingId,
    load,
    invite,
    remove,
  } = useCollaborators(projectId);
  const [email, setEmail] = useState("");

  // The list is fetched when the dialog opens, not when the workspace loads:
  // the Clerk profile lookup is only worth paying for on demand.
  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;

    if (await invite(email)) {
      setEmail("");
    }
  };

  return (
    <StackedDialog open={open} onOpenChange={onOpenChange}>
      <StackedDialogContent className="max-w-md">
        <StackedDialogHeader>
          <StackedDialogTitle>Share project</StackedDialogTitle>
          <StackedDialogDescription>
            {isOwner
              ? `Invite people to collaborate on ${projectName}.`
              : `People with access to ${projectName}.`}
          </StackedDialogDescription>
        </StackedDialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <ShareLinkField projectId={projectId} projectName={projectName} />

          {isOwner ? (
            <form className="flex items-end gap-2" onSubmit={handleInvite}>
              <div className="min-w-0 flex-1">
                <InputField
                  label="Invite by email"
                  type="email"
                  placeholder="teammate@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isInviting}
                  reserveMessageSpace={false}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-9 shrink-0"
                disabled={!email.trim()}
                loading={isInviting}
              >
                Invite
              </Button>
            </form>
          ) : (
            <p className="text-xs text-copy-muted">
              Only the project owner can invite or remove people.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.2em] text-copy-faint uppercase">
              People with access
            </p>

            {isLoading && collaborators.length === 0 ? (
              <p className="text-sm text-copy-muted">Loading collaborators…</p>
            ) : null}

            {hasLoaded && collaborators.length === 0 ? (
              <p className="text-sm text-copy-muted">
                No one else has access yet.
              </p>
            ) : null}

            {collaborators.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {collaborators.map((collaborator) => (
                  <li
                    key={collaborator.id}
                    data-slot="collaborator-row"
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-subtle"
                  >
                    <CollaboratorAvatar collaborator={collaborator} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-copy-primary">
                        {collaborator.name ?? collaborator.email}
                      </p>
                      {collaborator.name ? (
                        <p className="truncate text-xs text-copy-muted">
                          {collaborator.email}
                        </p>
                      ) : null}
                    </div>
                    {isOwner ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-copy-faint hover:text-error"
                        aria-label={`Remove ${collaborator.email}`}
                        disabled={removingId !== null}
                        loading={removingId === collaborator.id}
                        onClick={() => void remove(collaborator.id)}
                      >
                        <DeleteIcon size={16} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {error ? (
              <p role="alert" className="text-xs text-error">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </StackedDialogContent>
    </StackedDialog>
  );
}

function CollaboratorAvatar({
  collaborator,
}: {
  collaborator: CollaboratorView;
}) {
  if (collaborator.imageUrl) {
    return (
      // Clerk serves avatars from its own CDN, which next/image would require
      // configuring as a remote host just for this list.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={collaborator.imageUrl}
        alt=""
        width={32}
        height={32}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="size-8 shrink-0 rounded-full bg-surface-2 object-cover"
      />
    );
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-copy-faint">
      <UserIcon size={16} aria-hidden="true" />
    </span>
  );
}

function ShareLinkField({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // Safe to read at render time: the dialog content only mounts on the client
  // after the Share button opens it.
  const projectUrl = `${window.location.origin}/editor/${projectId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      setCopyFailed(false);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => setCopied(false),
        COPIED_FEEDBACK_MS,
      );
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Input
          readOnly
          inputSize="sm"
          className="min-w-0 flex-1 font-mono text-xs"
          aria-label={`Link to ${projectName}`}
          value={projectUrl}
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <CheckIcon size={14} aria-hidden="true" />
          ) : (
            <CopyIcon size={14} aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard." : ""}
      </span>
      {copyFailed ? (
        <p className="text-xs text-error">
          Could not copy the link. Select it and copy manually.
        </p>
      ) : null}
    </div>
  );
}
