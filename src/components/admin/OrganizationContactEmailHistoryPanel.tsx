"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, Mail, Paperclip, X } from "lucide-react";
import { sanitizeEmailHtml } from "@/lib/sanitize-email-html";
import type { ZohoEmailContent } from "@/lib/zoho";

type OrganizationContactEmailHistoryPanelProps = {
  contactEmail: string;
  contactLabel: string;
  open: boolean;
  onClose: () => void;
};

const PAGE_SIZE = 20;

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-admin-sm bg-admin-neutral-bg ${className}`} />;
}

function EmailHistoryListSkeleton() {
  return (
    <ul className="flex flex-col gap-2 pb-2" aria-busy="true" aria-label="Loading email history">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="rounded-admin-md border border-admin-border bg-admin-bg/40 px-3 py-2.5"
        >
          <SkeletonBlock className="h-4 w-4/5 animate-pulse" />
          <SkeletonBlock className="mt-2 h-3 w-3/5 animate-pulse" />
          <SkeletonBlock className="mt-2 h-3 w-1/3 animate-pulse" />
          <SkeletonBlock className="mt-2 h-3 w-full animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function formatMessageTime(timestampMs: number): string {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) return "—";
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function EmailMessageRow({
  message,
  bodyContent,
  bodyLoading,
  bodyError,
  onExpand,
}: {
  message: ZohoEmailContent;
  bodyContent: string | undefined;
  bodyLoading: boolean;
  bodyError: string | null;
  onExpand: () => void;
}) {
  const previewText =
    message.summary?.trim() ||
    message.subject?.trim() ||
    "(No preview available)";

  const sanitizedBody =
    bodyContent !== undefined ? sanitizeEmailHtml(bodyContent) : "";

  return (
    <li className="rounded-admin-md border border-admin-border bg-admin-bg/40">
      <details
        className="group"
        onToggle={(event) => {
          if ((event.target as HTMLDetailsElement).open) onExpand();
        }}
      >
        <summary className="cursor-pointer list-none px-3 py-2.5 [&::-webkit-details-marker]:hidden">
          <div className="flex items-start gap-2">
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-admin-faint transition-transform group-open:rotate-180" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-admin-text">
                {message.subject || "(No subject)"}
              </p>
              <p className="mt-0.5 text-xs text-admin-muted truncate">
                {message.fromAddress} → {message.toAddress}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-admin-faint">
                <span>{formatMessageTime(message.time)}</span>
                {message.hasAttachment ? (
                  <span className="inline-flex items-center gap-0.5">
                    <Paperclip className="h-3 w-3" aria-hidden />
                    Attachment
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-admin-muted group-open:hidden">
                {previewText}
              </p>
            </div>
          </div>
        </summary>
        <div className="border-t border-admin-border px-3 py-3">
          {bodyLoading ? (
            <div className="space-y-2" aria-busy="true">
              <SkeletonBlock className="h-3 w-full animate-pulse" />
              <SkeletonBlock className="h-3 w-5/6 animate-pulse" />
              <SkeletonBlock className="h-3 w-2/3 animate-pulse" />
            </div>
          ) : bodyError ? (
            <p className="text-sm text-admin-error">{bodyError}</p>
          ) : sanitizedBody ? (
            <div
              className="prose prose-sm max-w-none text-admin-text [&_a]:text-admin-accent [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />
          ) : message.content ? (
            <div
              className="prose prose-sm max-w-none text-admin-text [&_a]:text-admin-accent [&_img]:max-w-full"
              dangerouslySetInnerHTML={{
                __html: sanitizeEmailHtml(message.content),
              }}
            />
          ) : (
            <p className="text-sm text-admin-faint">No message body returned from Zoho.</p>
          )}
        </div>
      </details>
    </li>
  );
}

export default function OrganizationContactEmailHistoryPanel({
  contactEmail,
  contactLabel,
  open,
  onClose,
}: OrganizationContactEmailHistoryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ZohoEmailContent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextStart, setNextStart] = useState(1);
  const [contentByMessageId, setContentByMessageId] = useState<
    Record<string, string>
  >({});
  const [contentLoadingIds, setContentLoadingIds] = useState<Set<string>>(
    new Set(),
  );
  const [contentErrorByMessageId, setContentErrorByMessageId] = useState<
    Record<string, string>
  >({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadedContentIdsRef = useRef<Set<string>>(new Set());
  const loadingContentIdsRef = useRef<Set<string>>(new Set());

  const fetchPage = useCallback(
    async (start: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          email: contactEmail,
          start: String(start),
          limit: String(PAGE_SIZE),
        });
        const response = await fetch(`/api/zoho/thread?${params}`);
        const payload = (await response.json()) as {
          error?: string;
          data?: ZohoEmailContent[];
          hasMore?: boolean;
        };

        if (!response.ok) {
          const message =
            payload.error ??
            (response.status === 503
              ? "Zoho Mail is not configured in this environment."
              : "Failed to load email history.");
          throw new Error(message);
        }

        const pageMessages = payload.data ?? [];
        setMessages((prev) => (append ? [...prev, ...pageMessages] : pageMessages));
        setHasMore(Boolean(payload.hasMore));
        setNextStart(start + PAGE_SIZE);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load email history.",
        );
        if (!append) {
          setMessages([]);
          setHasMore(false);
          setNextStart(1);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [contactEmail],
  );

  const loadThread = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    await fetchPage(nextStart, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextStart]);

  const loadMessageContent = useCallback(async (message: ZohoEmailContent) => {
    if (message.content) return;
    if (loadedContentIdsRef.current.has(message.messageId)) return;
    if (loadingContentIdsRef.current.has(message.messageId)) return;

    loadingContentIdsRef.current.add(message.messageId);
    setContentLoadingIds(new Set(loadingContentIdsRef.current));
    setContentErrorByMessageId((prev) => {
      if (!prev[message.messageId]) return prev;
      const next = { ...prev };
      delete next[message.messageId];
      return next;
    });

    try {
      const params = new URLSearchParams({
        folderId: message.folderId,
        messageId: message.messageId,
      });
      const response = await fetch(`/api/zoho/message-content?${params}`);
      const payload = (await response.json()) as {
        error?: string;
        content?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load message body.");
      }

      loadedContentIdsRef.current.add(message.messageId);
      setContentByMessageId((prev) => ({
        ...prev,
        [message.messageId]: payload.content ?? "",
      }));
    } catch (loadError) {
      setContentErrorByMessageId((prev) => ({
        ...prev,
        [message.messageId]:
          loadError instanceof Error
            ? loadError.message
            : "Failed to load message body.",
      }));
    } finally {
      loadingContentIdsRef.current.delete(message.messageId);
      setContentLoadingIds(new Set(loadingContentIdsRef.current));
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setMessages([]);
      setHasMore(false);
      setNextStart(1);
      setContentByMessageId({});
      setContentErrorByMessageId({});
      setContentLoadingIds(new Set());
      loadedContentIdsRef.current = new Set();
      loadingContentIdsRef.current = new Set();
      void loadThread();
    });
  }, [loadThread, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !hasMore || loading || loadingMore) return;

    const root = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loading, loadingMore, messages.length, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-email-history-title"
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,32rem)] max-w-full flex-col overflow-hidden border-l border-admin-border bg-admin-surface shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-admin-border px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="contact-email-history-title"
                  className="flex items-center gap-2 text-sm font-semibold text-admin-text"
                >
                  <Mail className="h-4 w-4 shrink-0 text-admin-accent" aria-hidden />
                  Email history
                </h2>
                <p className="mt-0.5 text-xs text-admin-muted">{contactLabel}</p>
                <p className="mt-0.5 truncate text-[11px] text-admin-faint">{contactEmail}</p>
                <p className="mt-1 text-[11px] text-admin-faint">
                  From Zoho Mail (to/from this address). Read-only.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-admin-muted transition-colors hover:bg-admin-bg"
                aria-label="Close email history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
            >
              {loading && messages.length === 0 ? (
                <EmailHistoryListSkeleton />
              ) : error ? (
                <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
                  <p className="text-sm text-admin-error">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadThread()}
                    className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                  >
                    Try again
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-admin-faint">
                  No messages found for this address in Zoho Mail.
                </p>
              ) : (
                <>
                  <ul className="flex flex-col gap-2 pb-2">
                    {messages.map((message) => (
                      <EmailMessageRow
                        key={message.messageId}
                        message={message}
                        bodyContent={contentByMessageId[message.messageId]}
                        bodyLoading={contentLoadingIds.has(message.messageId)}
                        bodyError={contentErrorByMessageId[message.messageId] ?? null}
                        onExpand={() => void loadMessageContent(message)}
                      />
                    ))}
                  </ul>
                  <div ref={loadMoreRef} className="h-4" aria-hidden />
                  {loadingMore ? (
                    <div className="flex justify-center py-3">
                      <Loader2
                        className="h-4 w-4 animate-spin text-admin-faint"
                        aria-label="Loading more emails"
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
