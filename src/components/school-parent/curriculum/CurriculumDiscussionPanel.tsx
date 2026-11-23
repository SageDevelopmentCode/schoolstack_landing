"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, BookmarkCheck, FileText, Loader2, MessageSquare, SendHorizontal } from "lucide-react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import { formatChatDayLabel } from "@/lib/messages/format-chat";
import { colorForKey } from "@/lib/messages/format";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import { useMessageComposer } from "@/components/messages/useMessageComposer";
import { G_FOCUS, G_INPUT, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { useCurriculumThread, type CurriculumThread } from "./useCurriculumThread";

type CurriculumDiscussionPanelProps = {
  organizationId: string;
  programId: string;
  curriculumId?: string | null;
  /** Server-loaded messages for this thread (General); guide threads fetch. */
  initialMessages?: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
  previewMode?: boolean;
  embedded?: boolean;
  /** Use a thread the reader already holds (shares note counts + realtime). */
  thread?: CurriculumThread;
  /** The page open in the reader: enables the "About page N" chip. */
  currentPage?: number | null;
  /** Makes "Page N" pills jump the reader. */
  onJumpToPage?: (page: number) => void;
  /** Only show messages about this page. */
  pageFilter?: number | null;
  emptyTitle?: string;
  emptyBody?: string;
};

const NO_FILES: File[] = [];
const noop = () => {};

type DiscussionDayGroup = {
  dayKey: string;
  dayLabel: string;
  messages: ProgramCoopCurriculumDiscussionMessage[];
};

function groupDiscussionMessagesByDay(
  messages: ProgramCoopCurriculumDiscussionMessage[],
): DiscussionDayGroup[] {
  const groups: DiscussionDayGroup[] = [];

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const dayKey = Number.isNaN(date.getTime())
      ? "unknown"
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const last = groups[groups.length - 1];

    if (last && last.dayKey === dayKey) {
      last.messages.push(message);
      continue;
    }

    groups.push({
      dayKey,
      dayLabel: formatChatDayLabel(message.createdAt),
      messages: [message],
    });
  }

  return groups;
}

function familySubtitleForMessage(
  message: ProgramCoopCurriculumDiscussionMessage,
): string | null {
  const familyName = message.familyName.trim();
  if (!familyName || familyName === "Family") return null;
  if (familyName === message.senderDisplayName.trim()) return null;
  return familyName;
}

export default function CurriculumDiscussionPanel({
  organizationId,
  programId,
  curriculumId = null,
  initialMessages,
  currentGuardianId = null,
  previewMode = false,
  embedded = false,
  thread: externalThread,
  currentPage = null,
  onJumpToPage,
  pageFilter = null,
  emptyTitle = "Start the conversation",
  emptyBody = "Ask about this week's lessons or share a tip with the group.",
}: CurriculumDiscussionPanelProps) {
  const composerId = useId();
  const ownThread = useCurriculumThread({
    organizationId,
    programId,
    curriculumId,
    initialMessages,
    previewMode,
    enabled: !externalThread,
  });
  const thread = externalThread ?? ownThread;
  const { loading, sending, error } = thread;
  const messages = useMemo(
    () => (pageFilter ? thread.messages.filter((message) => message.pageNumber === pageFilter) : thread.messages),
    [pageFilter, thread.messages],
  );
  const [text, setText] = useState("");
  // "About page N" is on by default whenever a page is open.
  const [aboutPage, setAboutPage] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dayGroups = useMemo(() => groupDiscussionMessagesByDay(messages), [messages]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  const pageForPost = currentPage && (aboutPage || pageFilter) ? currentPage : null;

  const handleSend = async () => {
    const ok = await thread.send(text, pageForPost);
    if (ok) setText("");
  };

  const { textareaRef, canSend, handleKeyDown } = useMessageComposer({
    value: text,
    files: NO_FILES,
    onFilesChange: noop,
    onSend: () => void handleSend(),
    hideAttachments: true,
    autoGrow: true,
  });

  // The textarea is disabled while sending, which drops focus; hand it back
  // so the parent can keep typing (or retry) straight away.
  const wasSending = useRef(sending);
  useEffect(() => {
    if (wasSending.current && !sending && !previewMode) {
      const active = document.activeElement;
      if (!active || active === document.body) textareaRef.current?.focus();
    }
    wasSending.current = sending;
  }, [previewMode, sending, textareaRef]);

  const sendDisabled = previewMode || sending || !canSend;

  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white ${
        embedded ? "" : "rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12"
      }`}
      data-testid="curriculum-discussion-panel"
    >
      {embedded ? null : (
        <div className="shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3">
          <p className="sf-display m-0 text-[1.1rem] leading-tight text-[var(--sf-ink)]">
            Co-op discussion
          </p>
          <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">
            Chat with other families in your co-op
          </p>
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--sf-cream)] px-4 py-4 sm:px-5"
        aria-busy={loading || undefined}
      >
        {loading && messages.length === 0 ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-6 text-[13px] font-semibold text-[var(--sf-soft)]"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading discussion…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-sky)] text-[#24507a]"
            >
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                {emptyTitle}
              </p>
              <p className="m-0 mt-1 max-w-[240px] text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                {emptyBody}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {dayGroups.map((group) => (
              <section key={group.dayKey} aria-label={group.dayLabel} className="flex flex-col gap-3">
                <div className="flex justify-center">
                  <span className="rounded-full border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[var(--sf-soft)]">
                    {group.dayLabel}
                  </span>
                </div>
                {group.messages.map((message) => {
                  const isOwn =
                    Boolean(currentGuardianId) &&
                    message.senderGuardianId === currentGuardianId;
                  const familySubtitle = familySubtitleForMessage(message);
                  const colorKey = message.senderUserId ?? message.senderGuardianId;

                  return (
                    <div
                      key={message.id}
                      className={`flex min-w-0 items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <MessagesAvatar
                        name={message.senderDisplayName}
                        color={colorForKey(colorKey)}
                        photoUrl={message.profilePhotoUrl}
                        size="sm"
                      />
                      <div
                        className={`min-w-0 max-w-[min(78%,28rem)] rounded-[20px] px-4 py-2.5 ${
                          isOwn
                            ? "rounded-br-[6px] bg-[var(--sf-clay)] text-white"
                            : "rounded-bl-[6px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_2px_0_0_rgba(43,36,29,0.06)]"
                        }`}
                      >
                        <p
                          className={`m-0 text-xs font-extrabold ${
                            isOwn ? "text-white/80" : "text-[var(--sf-clay-deep)]"
                          }`}
                        >
                          {message.senderDisplayName}
                          {familySubtitle ? (
                            <span
                              className={`font-semibold ${
                                isOwn ? "text-white/70" : "text-[var(--sf-soft)]"
                              }`}
                            >
                              {" "}
                              · {familySubtitle}
                            </span>
                          ) : null}
                        </p>
                        {message.pageNumber ? (
                          onJumpToPage ? (
                            <button
                              type="button"
                              onClick={() => onJumpToPage(message.pageNumber!)}
                              aria-label={`Go to page ${message.pageNumber}`}
                              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold underline-offset-2 hover:underline ${G_FOCUS} ${
                                isOwn
                                  ? "bg-white/20 text-white"
                                  : "bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
                              }`}
                            >
                              <FileText className="h-3 w-3" aria-hidden />
                              Page {message.pageNumber}
                            </button>
                          ) : (
                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                                isOwn
                                  ? "bg-white/20 text-white"
                                  : "bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
                              }`}
                            >
                              Page {message.pageNumber}
                            </span>
                          )
                        ) : null}
                        <p
                          className={`m-0 mt-0.5 whitespace-pre-wrap break-words text-[14.5px] font-semibold leading-snug ${
                            isOwn ? "text-white" : "text-[var(--sf-ink)]"
                          }`}
                        >
                          {message.body}
                        </p>
                        <p
                          className={`m-0 mt-1 text-right text-[11px] font-semibold ${
                            isOwn ? "text-white/75" : "text-[var(--sf-soft)]"
                          }`}
                        >
                          {formatRelativeTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        )}
      </div>

      <form
        className="shrink-0 border-t-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        {error ? (
          <p
            role="alert"
            className="m-0 mb-2 flex items-start gap-2 text-[13px] font-semibold text-[#9a3412]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
        {currentPage && !pageFilter ? (
          <button
            type="button"
            onClick={() => setAboutPage((value) => !value)}
            aria-pressed={aboutPage}
            className={`mb-2 inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 text-[12px] font-extrabold transition-colors ${G_FOCUS} ${
              aboutPage
                ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
                : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-soft)]"
            }`}
          >
            <BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
            {aboutPage ? `About page ${currentPage}` : "Not about a page"}
          </button>
        ) : null}
        <div className="flex items-end gap-2">
          <label htmlFor={composerId} className="sr-only">
            Message the co-op
          </label>
          <textarea
            id={composerId}
            ref={textareaRef}
            value={text}
            rows={1}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={previewMode || sending}
            placeholder={
              previewMode
                ? "Preview mode — sending disabled"
                : pageForPost
                  ? `Add a note about page ${pageForPost}…`
                  : "Ask the co-op a question or share a tip…"
            }
            aria-describedby={`${composerId}-hint`}
            className={`${G_INPUT} max-h-[110px] min-h-[44px] flex-1 resize-none leading-[22px]`}
          />
          <button
            type="submit"
            disabled={sendDisabled}
            aria-busy={sending || undefined}
            className={`${gBtnPopSm} h-[44px] shrink-0`}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <SendHorizontal className="h-4 w-4" aria-hidden />
            )}
            Post
          </button>
        </div>
        <p
          id={`${composerId}-hint`}
          className="m-0 mt-1.5 hidden px-1 text-[11.5px] font-semibold text-[var(--sf-soft)] [@media(hover:hover)]:block"
        >
          <kbd className="font-extrabold text-[var(--sf-ink)]/70">Enter</kbd> to post ·{" "}
          <kbd className="font-extrabold text-[var(--sf-ink)]/70">Shift + Enter</kbd> for a new line
        </p>
      </form>
    </div>
  );
}
