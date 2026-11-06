"use client";

import { ArrowLeftIcon, LockIcon } from "lucide-animated";
import Link from "next/link";

import { buttonVariants } from "@/components/matos-ui/button";

export function AccessDenied() {
  return (
    <main
      data-slot="access-denied"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-base px-6 py-16 text-center"
    >
      <div className="flex max-w-sm flex-col items-center gap-2">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-surface-border bg-surface text-copy-muted">
          <LockIcon size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-copy-primary">
          You don&apos;t have access to this project
        </h1>
        <p className="text-sm leading-relaxed text-copy-muted">
          It may have been deleted, or the owner may not have invited you to it.
        </p>
      </div>

      <Link href="/editor" className={buttonVariants({ variant: "secondary" })}>
        <ArrowLeftIcon size={16} aria-hidden="true" />
        Back to projects
      </Link>
    </main>
  );
}
