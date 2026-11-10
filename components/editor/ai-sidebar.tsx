"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BotIcon,
  DownloadIcon,
  FileTextIcon,
  SendIcon,
  XIcon,
} from "lucide-animated";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tabs } from "radix-ui";

import { Button } from "@/components/matos-ui/button";
import { Textarea } from "@/components/matos-ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { spring, withReducedMotion } from "@/lib/motion-tokens";

export interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const MIN_TEXTAREA_HEIGHT = 72;
const MAX_TEXTAREA_HEIGHT = 160;

const sidebarVariants = {
  hidden: { x: "110%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring.moderate },
  exit: { x: "110%", opacity: 0, transition: spring.moderate.exit },
};

/**
 * Floating AI workspace shell. The parent owns open/close state; this component
 * provides the chat and specs UI without any AI or backend wiring yet.
 */
export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? withReducedMotion(sidebarVariants)
    : sidebarVariants;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(0);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${Math.min(
      Math.max(element.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    )}px`;
  }

  function submitMessage() {
    const content = message.trim();

    if (!content) {
      return;
    }

    nextMessageId.current += 1;
    setMessages((current) => [
      ...current,
      { id: nextMessageId.current, role: "user", content },
    ]);
    setMessage("");

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      textarea.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitMessage();
    }
  }

  function applyStarterPrompt(prompt: string) {
    setMessage(prompt);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (textarea) {
        textarea.focus();
        resizeTextarea(textarea);
      }
    });
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="ai-sidebar"
          id="ai-sidebar"
          data-slot="ai-sidebar"
          aria-label="AI workspace"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-[4.5rem] right-3 bottom-3 z-30 flex w-80 flex-col overflow-hidden rounded-2xl border border-surface-border bg-base/95 shadow-surface-6 backdrop-blur-xl"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-surface-border px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ai-text">
              <BotIcon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="ai-sidebar-title"
                className="truncate text-sm font-semibold text-copy-primary"
              >
                AI Workspace
              </h2>
              <p className="truncate text-[11px] text-copy-muted">
                Collaborate with Shadowmesh
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close AI sidebar"
              onClick={onClose}
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          </div>

          <Tabs.Root
            defaultValue="architect"
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs.List className="mx-4 mt-3 grid shrink-0 grid-cols-2 gap-1 rounded-xl border border-surface-border/70 bg-surface p-1">
              <Tabs.Trigger
                value="architect"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-copy-muted transition-colors outline-none hover:text-copy-secondary focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:bg-brand-dim data-[state=active]:text-brand"
              >
                AI Architect
              </Tabs.Trigger>
              <Tabs.Trigger
                value="specs"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-copy-muted transition-colors outline-none hover:text-copy-secondary focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:bg-brand-dim data-[state=active]:text-brand"
              >
                Specs
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              value="architect"
              className="flex min-h-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <ScrollArea className="min-h-0 flex-1">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-5 py-8 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-ai-text">
                      <BotIcon size={28} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-copy-primary">
                        Start with a system design
                      </p>
                      <p className="text-xs leading-relaxed text-copy-muted">
                        Describe your architecture and AI will map it onto the
                        shared canvas.
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => applyStarterPrompt(prompt)}
                          className="rounded-full border border-surface-border/70 bg-subtle px-3 py-2 text-left text-xs text-ai-text transition-colors hover:bg-surface-2"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    aria-live="polite"
                    className="flex flex-col gap-3 p-4"
                  >
                    {messages.map((entry) => (
                      <p
                        key={entry.id}
                        className={
                          entry.role === "user"
                            ? "ml-auto max-w-[85%] rounded-2xl border-2 border-brand/50 bg-brand-dim px-3 py-2 text-sm text-copy-primary"
                            : "mr-auto max-w-[85%] rounded-2xl border border-surface-border bg-elevated px-3 py-2 text-sm text-ai-text"
                        }
                      >
                        {entry.content}
                      </p>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <form
                onSubmit={handleSubmit}
                className="shrink-0 border-t border-surface-border p-3"
              >
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      resizeTextarea(event.target);
                    }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    aria-label="Message AI Architect"
                    placeholder="Describe your architecture…"
                    className="max-h-40 min-h-[72px] min-w-0 flex-1 resize-none overflow-y-auto py-2.5"
                  />
                  <Button
                    type="submit"
                    size="icon-lg"
                    aria-label="Send message"
                    disabled={!message.trim()}
                    className="bg-brand text-primary-foreground hover:bg-brand/90"
                  >
                    <SendIcon size={16} aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </Tabs.Content>

            <Tabs.Content
              value="specs"
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 outline-none data-[state=inactive]:hidden"
            >
              <Button
                type="button"
                className="w-full bg-brand text-primary-foreground hover:bg-brand/90"
              >
                <FileTextIcon size={16} aria-hidden="true" />
                Generate Spec
              </Button>

              <article className="rounded-2xl border border-surface-border bg-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ai-text">
                      <FileTextIcon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-copy-primary">
                        System Architecture Spec
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                        A high-level overview of services, data stores, and
                        request flows for the current canvas.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled
                    aria-label="Download spec"
                  >
                    <DownloadIcon size={16} aria-hidden="true" />
                  </Button>
                </div>
              </article>
            </Tabs.Content>
          </Tabs.Root>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
