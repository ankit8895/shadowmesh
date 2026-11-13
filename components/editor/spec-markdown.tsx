"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown is model output, so it is rendered as plain Markdown: no raw HTML
 * passes through, and every element is mapped onto the project's theme tokens
 * instead of relying on typography plugin defaults.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 text-lg font-semibold text-copy-primary first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-base font-semibold text-copy-primary first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-sm font-semibold text-copy-primary first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1 text-xs font-semibold tracking-wide text-copy-secondary uppercase first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2 text-sm leading-relaxed text-copy-secondary">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 text-sm text-copy-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 text-sm text-copy-secondary">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed [&>p]:my-0">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-copy-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  // GFM task lists render a disabled checkbox; the model never gets to make it
  // interactive, so it is styled as a static bullet marker.
  input: ({ type, checked }) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled
        readOnly
        aria-hidden="true"
        className="mr-1 size-3.5 accent-brand align-middle"
      />
    ) : null,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-brand underline underline-offset-2 hover:text-brand/80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-surface-border pl-3 text-sm text-copy-muted italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-surface-border" />,
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl border border-surface-border bg-surface p-3 font-mono text-xs leading-relaxed text-copy-secondary [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-copy-secondary">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={
        className
          ? `font-mono ${className}`
          : "rounded bg-subtle px-1 py-0.5 font-mono text-xs text-ai-text"
      }
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-3 w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="text-copy-primary">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-surface-border px-2 py-1.5 font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-surface-border/60 px-2 py-1.5 text-copy-secondary">
      {children}
    </td>
  ),
};

export function SpecMarkdown({ markdown }: { markdown: string }) {
  return (
    <div data-slot="spec-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </div>
  );
}
