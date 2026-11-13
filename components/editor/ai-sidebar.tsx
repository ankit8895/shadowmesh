"use client";

import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useFeeds,
} from "@liveblocks/react";
import { useSelf } from "@liveblocks/react/suspense";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BotIcon,
  FileTextIcon,
  SendIcon,
  XIcon,
} from "lucide-animated";
import {
  createContext,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs } from "radix-ui";

import { SpecList } from "@/components/editor/spec-list";
import { SpecPreviewDialog } from "@/components/editor/spec-preview-dialog";
import { Button } from "@/components/matos-ui/button";
import { Textarea } from "@/components/matos-ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useProjectSpecs,
  type ProjectSpecSummary,
} from "@/hooks/use-project-specs";
import { readErrorMessage } from "@/lib/api-error";
import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
import { spring, withReducedMotion } from "@/lib/motion-tokens";
import {
  MAX_SPEC_CHAT_MESSAGES,
  MAX_SPEC_EDGES,
  MAX_SPEC_NODES,
} from "@/lib/spec-input";
import { cn } from "@/lib/utils";
import {
  AI_CHAT_FEED_ID,
  AI_CHAT_MAX_CONTENT_LENGTH,
  AI_RUN_STALE_AFTER_MS,
  AI_STATUS_FEED_ID,
  MAX_CHAT_TIMESTAMP,
  parseAiChatMessage,
  parseAiStatusFeedPayload,
  type AiChatMessage,
  type AiStatusFeedPayload,
} from "@/types/tasks";

export interface AiSidebarProps {
  isOpen: boolean;
  /** The open project; it is also the Liveblocks room the agent writes to. */
  projectId: string;
  /**
   * Reads the canvas as it is at this moment. The shell fills it once the flow
   * mounts, so the sidebar can send the current drawing without owning it.
   */
  canvasSnapshotRef?: RefObject<(() => CanvasSnapshot) | null>;
  /**
   * Whether the room's feeds may be requested. The sidebar mounts closed, but
   * feed reads only start once it has been opened at least once, so visiting
   * the editor never depends on the feed API.
   */
  feedsEnabled: boolean;
  onClose: () => void;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const MIN_TEXTAREA_HEIGHT = 72;
const MAX_TEXTAREA_HEIGHT = 160;

/** Display name used for the replies the sidebar posts into the room chat. */
const AI_CHAT_SENDER = "Shadowmesh AI";

const sidebarVariants = {
  hidden: { x: "110%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: spring.moderate },
  exit: { x: "110%", opacity: 0, transition: spring.moderate.exit },
};

/** Feed timestamps are shown in a fixed locale so SSR and the client agree. */
const chatTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

/** Liveblocks answers with a conflict when a feed already exists. */
function isFeedAlreadyExistsError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { status?: unknown }).status === 409
  );
}

/** Run statuses that mean the realtime subscription has nothing left to send. */
const TERMINAL_RUN_STATUSES = [
  "COMPLETED",
  "FAILED",
  "CANCELED",
  "SYSTEM_FAILURE",
  "CRASHED",
  "EXPIRED",
  "TIMED_OUT",
] as const;

function isTerminalRunStatus(status: string): boolean {
  return (TERMINAL_RUN_STATUSES as readonly string[]).includes(status);
}

/** A `running` status the agent could no longer be working on is ignored. */
function isStaleStatus(
  status: AiStatusSnapshot | null,
  clock: number,
): boolean {
  return status !== null && clock > 0 && clock - status.at >= AI_RUN_STALE_AFTER_MS;
}

/**
 * Formats a feed timestamp, tolerating values a `Date` cannot represent: any
 * room member can write to the chat feed, and a huge timestamp used to throw
 * while rendering.
 */
function formatChatTimestamp(
  timestamp: number,
): { iso: string; label: string } | null {
  if (
    !Number.isFinite(timestamp) ||
    timestamp < 0 ||
    timestamp > MAX_CHAT_TIMESTAMP
  ) {
    return null;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return { iso: date.toISOString(), label: chatTimeFormatter.format(date) };
}

interface ActiveRun {
  runId: string;
  publicToken: string;
}

interface DesignRunHandle {
  runId: string;
  publicToken: string;
}

/** The design route returns a token when it can; otherwise the token route does. */
async function fetchRunToken(
  runId: string,
  endpoint = "/api/ai/design/token",
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const body = (await response.json()) as { token?: unknown };

  if (typeof body.token !== "string" || body.token === "") {
    throw new Error("The run token could not be read.");
  }

  return body.token;
}

async function startDesignRun(prompt: string, roomId: string): Promise<DesignRunHandle> {
  const response = await fetch("/api/ai/design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, roomId, projectId: roomId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const body = (await response.json()) as {
    runId?: unknown;
    publicToken?: unknown;
  };

  if (typeof body.runId !== "string" || body.runId === "") {
    throw new Error("The design run did not return a run ID.");
  }

  const publicToken =
    typeof body.publicToken === "string" && body.publicToken !== ""
      ? body.publicToken
      : await fetchRunToken(body.runId);

  return { runId: body.runId, publicToken };
}

/**
 * Sends the room's canvas and chat to the spec route and returns the run to
 * follow. The route derives the project from the room, so the canvas that is
 * specified is the one the caller can actually open.
 */
async function startSpecRun(payload: {
  roomId: string;
  chatHistory: { role: "user" | "assistant"; content: string }[];
  nodes: { id: string; data: { label: string; shape: string } }[];
  edges: {
    id: string;
    source: string;
    target: string;
    data: { label: string };
  }[];
}): Promise<ActiveRun> {
  const response = await fetch("/api/ai/spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const body = (await response.json()) as { runId?: unknown };

  if (typeof body.runId !== "string" || body.runId === "") {
    throw new Error("The spec run did not return a run ID.");
  }

  return {
    runId: body.runId,
    publicToken: await fetchRunToken(body.runId, "/api/ai/spec/token"),
  };
}

/**
 * The newest status published by an AI run. Every participant reads the same
 * value from the room's `ai-status-feed` feed.
 */
interface AiStatusSnapshot extends AiStatusFeedPayload {
  /** When the status message was created, in ms since the epoch. */
  at: number;
}

const AiStatusContext = createContext<AiStatusSnapshot | null>(null);

/**
 * Feeds only exist once something has created them, and reading a feed that is
 * missing fails, so the subscription waits until the room lists the feed.
 */
function AiStatusProvider({
  enabled,
  children,
}: {
  /** Feeds are only requested once the workspace has actually been opened. */
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) {
    return (
      <AiStatusContext.Provider value={null}>
        {children}
      </AiStatusContext.Provider>
    );
  }

  return <AiStatusSubscriber>{children}</AiStatusSubscriber>;
}

/**
 * Feed reads use the non-suspense hooks: a missing or slow feed becomes an
 * empty result instead of an error thrown into the room boundary.
 */
function AiStatusSubscriber({ children }: { children: ReactNode }) {
  const feedsResult = useFeeds();
  const feeds = ("feeds" in feedsResult ? feedsResult.feeds : undefined) ?? [];
  const hasStatusFeed = feeds.some((feed) => feed.feedId === AI_STATUS_FEED_ID);

  if (!hasStatusFeed) {
    return (
      <AiStatusContext.Provider value={null}>
        {children}
      </AiStatusContext.Provider>
    );
  }

  return <AiStatusFeedReader>{children}</AiStatusFeedReader>;
}

function AiStatusFeedReader({ children }: { children: ReactNode }) {
  // Only the latest message is rendered; history stays in the feed itself.
  const messagesResult = useFeedMessages(AI_STATUS_FEED_ID);
  const messages =
    ("messages" in messagesResult ? messagesResult.messages : undefined) ?? [];
  const latest = messages.at(-1);
  const status = parseAiStatusFeedPayload(latest?.data);
  const snapshot: AiStatusSnapshot | null =
    status && latest ? { ...status, at: latest.createdAt } : null;

  return (
    <AiStatusContext.Provider value={snapshot}>
      {children}
    </AiStatusContext.Provider>
  );
}

function useAiStatus(): AiStatusSnapshot | null {
  return useContext(AiStatusContext);
}

interface RoomChatMessage extends AiChatMessage {
  /** Feed message id, used as the render key. */
  id: string;
}

interface RoomChatValue {
  messages: RoomChatMessage[];
  /** The current participant's display name, used to mark their own messages. */
  viewerName: string;
  sendMessage: (content: string) => Promise<void>;
  sendAssistantMessage: (content: string) => Promise<void>;
  /** True when the room's feeds could not be read, so chat cannot load. */
  isChatUnavailable: boolean;
}

const NO_CHAT_MESSAGES: RoomChatMessage[] = [];

const RoomChatContext = createContext<RoomChatValue>({
  messages: NO_CHAT_MESSAGES,
  viewerName: "",
  sendMessage: async () => {},
  sendAssistantMessage: async () => {},
  isChatUnavailable: false,
});

function useRoomChat(): RoomChatValue {
  return useContext(RoomChatContext);
}

/**
 * Owns the room's `ai-chat` feed. The feed is created on first use (idempotent,
 * so two participants racing is harmless) and kept apart from the AI status
 * feed: chat messages never appear in the progress indicator.
 */
function RoomChatProvider({
  enabled,
  children,
}: {
  /** Feeds are only requested once the workspace has actually been opened. */
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) {
    return (
      <RoomChatContext.Provider
        value={{
          messages: NO_CHAT_MESSAGES,
          viewerName: "",
          sendMessage: async () => {},
          sendAssistantMessage: async () => {},
          isChatUnavailable: false,
        }}
      >
        {children}
      </RoomChatContext.Provider>
    );
  }

  return <RoomChatSession>{children}</RoomChatSession>;
}

function RoomChatSession({ children }: { children: ReactNode }) {
  const feedsResult = useFeeds();
  const createFeed = useCreateFeed();
  const createMessage = useCreateFeedMessage();
  const self = useSelf();
  const feeds = ("feeds" in feedsResult ? feedsResult.feeds : undefined) ?? [];
  const hasChatFeed = feeds.some((feed) => feed.feedId === AI_CHAT_FEED_ID);
  const isChatUnavailable = "error" in feedsResult;
  const viewerName = self?.info.name.trim() || "Collaborator";

  useEffect(() => {
    if (hasChatFeed) {
      return;
    }

    createFeed(AI_CHAT_FEED_ID).catch((error: unknown) => {
      if (!isFeedAlreadyExistsError(error)) {
        console.error("Unable to create the room chat feed.", error);
      }
    });
  }, [createFeed, hasChatFeed]);

  const postMessage = useCallback(
    async (content: string, sender: string, role: AiChatMessage["role"]) => {
      if (!hasChatFeed) {
        try {
          await createFeed(AI_CHAT_FEED_ID);
        } catch (error) {
          if (!isFeedAlreadyExistsError(error)) {
            throw error;
          }
        }
      }

      await createMessage(AI_CHAT_FEED_ID, {
        sender,
        role,
        content: content.slice(0, AI_CHAT_MAX_CONTENT_LENGTH),
        timestamp: Date.now(),
      });
    },
    [createFeed, createMessage, hasChatFeed],
  );

  const sendMessage = useCallback(
    (content: string) => postMessage(content, viewerName, "user"),
    [postMessage, viewerName],
  );

  const sendAssistantMessage = useCallback(
    (content: string) => postMessage(content, AI_CHAT_SENDER, "assistant"),
    [postMessage],
  );

  if (!hasChatFeed) {
    return (
      <RoomChatContext.Provider
        value={{
          messages: NO_CHAT_MESSAGES,
          viewerName,
          sendMessage,
          sendAssistantMessage,
          isChatUnavailable,
        }}
      >
        {children}
      </RoomChatContext.Provider>
    );
  }

  return (
    <RoomChatFeedReader
      sendMessage={sendMessage}
      sendAssistantMessage={sendAssistantMessage}
      viewerName={viewerName}
      isChatUnavailable={isChatUnavailable}
    >
      {children}
    </RoomChatFeedReader>
  );
}

function RoomChatFeedReader({
  sendMessage,
  sendAssistantMessage,
  viewerName,
  isChatUnavailable,
  children,
}: {
  sendMessage: (content: string) => Promise<void>;
  sendAssistantMessage: (content: string) => Promise<void>;
  viewerName: string;
  isChatUnavailable: boolean;
  children: ReactNode;
}) {
  const messagesResult = useFeedMessages(AI_CHAT_FEED_ID);

  // Untrusted feed data is validated and ordered before it reaches the UI.
  const chatMessages = useMemo(() => {
    const messages =
      ("messages" in messagesResult ? messagesResult.messages : undefined) ?? [];

    return messages
      .flatMap((entry) => {
        const parsed = parseAiChatMessage(entry.data);

        return parsed ? [{ ...parsed, id: entry.id }] : [];
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messagesResult]);

  return (
    <RoomChatContext.Provider
      value={{
        messages: chatMessages,
        viewerName,
        sendMessage,
        sendAssistantMessage,
        isChatUnavailable,
      }}
    >
      {children}
    </RoomChatContext.Provider>
  );
}

/**
 * Specs tab: the project's saved specs, newest first, plus the action that
 * generates one from the current canvas and conversation. The list is fetched
 * when the tab mounts, and the Markdown is only requested for the open preview,
 * so the sidebar never holds spec content it is not showing.
 */
function SpecsTab({
  projectId,
  canvasSnapshotRef,
}: {
  projectId: string;
  canvasSnapshotRef?: RefObject<(() => CanvasSnapshot) | null>;
}) {
  const { specs, hasLoaded, error, reload } = useProjectSpecs(projectId);
  const { messages } = useRoomChat();
  const [previewSpec, setPreviewSpec] = useState<ProjectSpecSummary | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const finishedRunIdRef = useRef<string | null>(null);
  const isGenerating = isStarting || activeRun !== null;

  const { run, error: runError } = useRealtimeRun(activeRun?.runId, {
    accessToken: activeRun?.publicToken,
    enabled: activeRun !== null,
  });

  // One refresh per run: the run object keeps updating until the subscription
  // stops, so the id guard keeps the list from reloading twice.
  useEffect(() => {
    if (!activeRun || !run || run.id !== activeRun.runId) {
      return;
    }

    if (!isTerminalRunStatus(run.status)) {
      return;
    }

    if (finishedRunIdRef.current === run.id) {
      return;
    }

    finishedRunIdRef.current = run.id;

    const succeeded = run.status === "COMPLETED";

    void (async () => {
      if (succeeded) {
        reload();
      } else {
        setGenerateError(
          "The spec run ended before it could be saved. Try again.",
        );
      }

      setActiveRun(null);
      setIsStarting(false);
    })();
  }, [activeRun, run, reload]);

  // A broken subscription must not leave the button disabled for the session.
  useEffect(() => {
    if (!activeRun || !runError) {
      return;
    }

    if (finishedRunIdRef.current === activeRun.runId) {
      return;
    }

    finishedRunIdRef.current = activeRun.runId;

    void (async () => {
      setGenerateError(
        "Lost the live connection to this spec run. Check the list again in a moment.",
      );
      setActiveRun(null);
      setIsStarting(false);
    })();
  }, [activeRun, runError]);

  // The task gives up after five minutes, so a run that never reports must not
  // keep the button disabled; refresh whatever it managed to save.
  useEffect(() => {
    if (!activeRun) {
      return;
    }

    const timer = setTimeout(() => {
      reload();
      setGenerateError(
        "The spec is taking longer than expected. Check the list again in a moment.",
      );
      setActiveRun(null);
      setIsStarting(false);
    }, AI_RUN_STALE_AFTER_MS);

    return () => clearTimeout(timer);
  }, [activeRun, reload]);

  function handleGenerate() {
    if (isGenerating) {
      return;
    }

    const snapshot = canvasSnapshotRef?.current?.() ?? null;

    if (!snapshot) {
      setGenerateError("The canvas is still loading. Try again in a moment.");
      return;
    }

    const nodeIds = new Set(snapshot.nodes.map((node) => node.id));
    const nodes = snapshot.nodes.slice(0, MAX_SPEC_NODES).map((node) => ({
      id: node.id,
      data: { label: node.data.label, shape: node.data.shape },
    }));
    const edges = snapshot.edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .slice(0, MAX_SPEC_EDGES)
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: { label: edge.data?.label ?? "" },
      }));
    const chatHistory = messages
      .slice(-MAX_SPEC_CHAT_MESSAGES)
      .map((message) => ({ role: message.role, content: message.content }));

    if (nodes.length === 0 && chatHistory.length === 0) {
      setGenerateError(
        "Draw the architecture on the canvas or chat with the AI Architect first.",
      );
      return;
    }

    setGenerateError(null);
    setIsStarting(true);
    finishedRunIdRef.current = null;

    void (async () => {
      try {
        const started = await startSpecRun({
          roomId: projectId,
          chatHistory,
          nodes,
          edges,
        });

        setActiveRun(started);
      } catch (error) {
        setGenerateError(
          error instanceof Error && error.message
            ? error.message
            : "The spec run could not be started.",
        );
      } finally {
        setIsStarting(false);
      }
    })();
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        aria-busy={isGenerating}
        className="w-full shrink-0 bg-brand text-primary-foreground hover:bg-brand/90"
      >
        {isGenerating ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : (
          <FileTextIcon size={16} aria-hidden="true" />
        )}
        {isGenerating ? "Generating spec…" : "Generate Spec"}
      </Button>

      {generateError ? (
        <p role="alert" className="text-[11px] leading-relaxed text-error">
          {generateError}
        </p>
      ) : null}

      <SpecList
        projectId={projectId}
        specs={specs}
        hasLoaded={hasLoaded}
        error={error}
        onSelect={setPreviewSpec}
        onRetry={reload}
      />

      <SpecPreviewDialog
        projectId={projectId}
        spec={previewSpec}
        onOpenChange={(open) => {
          if (!open) setPreviewSpec(null);
        }}
      />
    </>
  );
}

/**
 * Floating AI workspace shell, mounted inside the room. The parent owns
 * open/close state.
 *
 * The conversation lives in the room's `ai-chat` feed, AI progress comes from
 * `ai-status-feed`, and the submitting client follows its own run through
 * `useRealtimeRun` so it can post the result back into the chat.
 */
export function AiSidebar(props: AiSidebarProps) {
  return (
    <AiStatusProvider enabled={props.feedsEnabled}>
      <RoomChatProvider enabled={props.feedsEnabled}>
        <AiSidebarView {...props} />
      </RoomChatProvider>
    </AiStatusProvider>
  );
}

function AiSidebarView({
  isOpen,
  projectId,
  canvasSnapshotRef,
  onClose,
}: AiSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion
    ? withReducedMotion(sidebarVariants)
    : sidebarVariants;
  const aiStatus = useAiStatus();
  const {
    messages,
    viewerName,
    sendMessage,
    sendAssistantMessage,
    isChatUnavailable,
  } = useRoomChat();
  const isRunningStatus = aiStatus?.status === "running";
  const [runClock, setRunClock] = useState(0);
  const isGenerating = isRunningStatus && !isStaleStatus(aiStatus, runClock);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const isRunActive = activeRun !== null;
  const isBusy = isGenerating || isSending || isRunActive;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finishedRunIdRef = useRef<string | null>(null);

  const { run, error: runError } = useRealtimeRun(activeRun?.runId, {
    accessToken: activeRun?.publicToken,
    enabled: isRunActive,
  });

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // A run can die without publishing a terminal status. Advance a clock while
  // a run claims to be running so an abandoned status can expire instead of
  // keeping the composer disabled for the rest of the session.
  useEffect(() => {
    if (!isRunningStatus) {
      return;
    }

    const timer = setInterval(() => setRunClock(Date.now()), 30_000);

    return () => clearInterval(timer);
  }, [isRunningStatus]);

  // One reply per run: the run object keeps updating until the subscription
  // stops, so the id guard keeps this from posting twice.
  useEffect(() => {
    if (!activeRun || !run || run.id !== activeRun.runId) {
      return;
    }

    if (!isTerminalRunStatus(run.status)) {
      return;
    }

    if (finishedRunIdRef.current === run.id) {
      return;
    }

    finishedRunIdRef.current = run.id;

    const succeeded = run.status === "COMPLETED";
    const reply = succeeded
      ? "Design complete — the canvas has been updated."
      : "The design run ended before it could update the canvas. Try again with a new prompt.";

    void (async () => {
      try {
        await sendAssistantMessage(reply);
      } catch {
        // The status feed still shows the outcome if the chat write fails.
      }

      setActiveRun(null);
      setIsSending(false);
    })();
  }, [activeRun, run, sendAssistantMessage]);

  // A broken subscription would otherwise leave the composer disabled for the
  // rest of the session; the status feed still carries the run's outcome.
  useEffect(() => {
    if (!activeRun || !runError) {
      return;
    }

    if (finishedRunIdRef.current === activeRun.runId) {
      return;
    }

    finishedRunIdRef.current = activeRun.runId;

    void (async () => {
      try {
        await sendAssistantMessage(
          "Lost the live connection to this design run. Check the canvas or try again.",
        );
      } catch {
        // Nothing else to report if the chat write fails too.
      }

      setActiveRun(null);
      setIsSending(false);
    })();
  }, [activeRun, runError, sendAssistantMessage]);

  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${Math.min(
      Math.max(element.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    )}px`;
  }

  async function submitMessage() {
    const content = message.trim();

    if (!content || isBusy) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await sendMessage(content);
    } catch {
      setSendError("Couldn't send your message. Try again in a moment.");
      setIsSending(false);
      return;
    }

    // The message is in the room feed, so the composer can be cleared.
    setMessage("");

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      textarea.focus();
    }

    try {
      const started = await startDesignRun(content, projectId);
      finishedRunIdRef.current = null;
      setActiveRun(started);
    } catch (error) {
      const detail =
        error instanceof Error && error.message
          ? error.message
          : "The design run could not be started.";

      try {
        await sendAssistantMessage(`Design run couldn't start — ${detail}`);
      } catch {
        setSendError(detail);
      }
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submitMessage();
    }
  }

  function applyStarterPrompt(prompt: string) {
    setSendError(null);
    setMessage(prompt);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (textarea) {
        textarea.focus();
        resizeTextarea(textarea);
      }
    });
  }

  const showStatusStrip = isRunActive || isGenerating;
  const statusText = aiStatus?.text ?? "AI is working on the canvas…";

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
                {messages.length === 0 && isChatUnavailable ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-5 py-8 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-error">
                      <BotIcon size={28} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-copy-primary">
                        Room chat is unavailable
                      </p>
                      <p className="text-xs leading-relaxed text-copy-muted">
                        The room&apos;s chat feed could not be loaded. Your canvas
                        is unaffected — reload the page to try again.
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
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
                        shared canvas. Everyone in the room sees the
                        conversation.
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
                  <div aria-live="polite" className="flex flex-col gap-3 p-4">
                    {messages.map((entry) => {
                      const isOwn =
                        entry.role === "user" && entry.sender === viewerName;
                      const timestamp = formatChatTimestamp(entry.timestamp);

                      return (
                        <article
                          key={entry.id}
                          data-slot="room-chat-message"
                          data-role={entry.role}
                          className={cn(
                            "flex max-w-[85%] flex-col gap-1",
                            isOwn ? "ml-auto items-end" : "mr-auto items-start",
                          )}
                        >
                          <div className="flex max-w-full items-center gap-1.5 text-[10px] text-copy-muted">
                            <span className="truncate font-medium text-copy-secondary">
                              {entry.sender}
                            </span>
                            <span aria-hidden="true">·</span>
                            {timestamp ? (
                              <time
                                dateTime={timestamp.iso}
                                className="shrink-0 tabular-nums"
                              >
                                {timestamp.label}
                              </time>
                            ) : null}
                          </div>
                          <p
                            className={cn(
                              "rounded-2xl px-3 py-2 text-sm break-words",
                              isOwn
                                ? "bg-success text-primary-foreground"
                                : "border border-surface-border bg-elevated text-copy-primary",
                            )}
                          >
                            {entry.content}
                          </p>
                        </article>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <form
                onSubmit={handleSubmit}
                className="shrink-0 border-t border-surface-border p-3"
              >
                {showStatusStrip ? (
                  <div
                    role="status"
                    aria-live="polite"
                    data-slot="ai-status"
                    className="mb-2 flex items-center gap-2 rounded-lg border border-success/30 bg-surface px-2.5 py-1.5"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 animate-pulse rounded-full bg-success"
                    />
                    <p className="min-w-0 flex-1 truncate text-[11px] leading-4 text-copy-secondary">
                      {statusText}
                    </p>
                  </div>
                ) : null}
                {sendError ? (
                  <p role="alert" className="pb-2 text-[11px] text-error">
                    {sendError}
                  </p>
                ) : null}
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      setSendError(null);
                      resizeTextarea(event.target);
                    }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    maxLength={AI_CHAT_MAX_CONTENT_LENGTH}
                    disabled={isBusy}
                    aria-label="Message AI Architect"
                    placeholder={
                      isBusy
                        ? "AI is working on the canvas…"
                        : "Describe your architecture…"
                    }
                    className="max-h-40 min-h-[72px] min-w-0 flex-1 resize-none overflow-y-auto py-2.5"
                  />
                  <Button
                    type="submit"
                    size="icon-lg"
                    aria-label={isBusy ? "AI is working" : "Send message"}
                    aria-busy={isBusy}
                    disabled={!message.trim() || isBusy}
                    className="bg-success text-primary-foreground hover:bg-success/90"
                  >
                    {isBusy ? (
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      />
                    ) : (
                      <SendIcon size={16} aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </form>
            </Tabs.Content>

            <Tabs.Content
              value="specs"
              className="flex min-h-0 flex-1 flex-col gap-3 p-4 outline-none data-[state=inactive]:hidden"
            >
              <SpecsTab
                projectId={projectId}
                canvasSnapshotRef={canvasSnapshotRef}
              />
            </Tabs.Content>
          </Tabs.Root>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
