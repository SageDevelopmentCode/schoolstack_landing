"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Users } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import MessageAttachments from "@/components/messages/MessageAttachments";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import type { MessagesFeedbackEvent } from "@/components/messages/messages-inbox-view-model";
import GardenComposer from "@/components/school-parent/messages/garden/GardenComposer";
import { GIcon, GKicker } from "@/components/school-parent/garden/ui";
import LinkifiedText from "@/components/text/LinkifiedText";
import { formatCommitteeMessageTime } from "@/lib/committees/format-committee-message-time";
import type { Committee, CommitteeMessage } from "@/lib/committees/types";
import { colorForKey } from "@/lib/messages/format";
import { describeParentMessagesFeedback } from "@/lib/messages/parent-messages-feedback";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { parentToast } from "@/lib/school-parent/parent-toast";

const STARTERS = [
  "Introduce yourself and say what you'd like to help with.",
  "Ask a question about an upcoming task or date.",
  "Share a file or link the committee will need.",
];

/**
 * Committee chat (Garden): a full-bleed pane (header bar, scrolling list,
 * composer pinned at the bottom) with Garden bubbles (grouped by
 * sender, names on others' messages, a "Sent ✓" line after your latest send)
 * and the parent Garden composer. Normal sends stay quiet; failures toast with
 * Try again and the text stays in the composer.
 */
export default function GardenCommitteeMessages({
  committee,
  composeTokens,
  readOnly,
  isOwn,
  senderLabel,
  resolveAttachmentUrl,
  text,
  onTextChange,
  files,
  onFilesChange,
  sending,
  onSend,
  showSent,
  panelTestId,
}: {
  committee: Committee;
  composeTokens: AdminThemeTokens;
  readOnly: boolean;
  isOwn: (message: CommitteeMessage) => boolean;
  senderLabel: (message: CommitteeMessage) => string;
  resolveAttachmentUrl: Parameters<typeof MessageAttachments>[0]["resolveAttachmentUrl"];
  text: string;
  onTextChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  sending: boolean;
  onSend: () => void;
  showSent: boolean;
  panelTestId: string;
}) {
  const reduce = useReducedMotion() === true;
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const messages = committee.messages;
  const activeMembers = committee.members.filter((member) => member.status === "active");

  const contentRef = useRef<HTMLDivElement>(null);
  /** True while the reader is at (or near) the newest message. */
  const stickToBottomRef = useRef(true);

  // Keep the newest message in view by scrolling only the list (scrollIntoView
  // would also nudge the workspace's outer scroll containers).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    stickToBottomRef.current = true;
    list.scrollTo({ top: list.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, reduce]);

  // The pane can mount hidden (scrollHeight 0) and images load after first
  // paint: whenever the list or its content changes size, stay pinned to the
  // bottom unless the reader has scrolled up.
  useEffect(() => {
    const list = listRef.current;
    const content = contentRef.current;
    if (!list || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) list.scrollTop = list.scrollHeight;
    });
    observer.observe(list);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const notify = (event: MessagesFeedbackEvent) => {
    const toast = describeParentMessagesFeedback(event);
    if (toast.kind === "error") parentToast.error(toast.title, { id: toast.id, description: toast.description });
    else parentToast.success(toast.title, { id: toast.id, description: toast.description });
  };

  let body: ReactNode;
  if (messages.length === 0) {
    body = (
      <div className="m-auto w-full max-w-[440px] px-2 py-8 text-center">
        <div className="flex justify-center">
          <GIcon size="lg">
            <MessageCircle />
          </GIcon>
        </div>
        <h3 className="sf-display m-0 mt-4 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]">No messages yet</h3>
        <p className="m-0 mt-2 text-[14px] font-semibold text-[var(--sf-soft)]">
          Start the conversation with your committee. Share updates, questions, and coordination with other members.
        </p>
        {!readOnly ? (
          <ul className="m-0 mt-5 list-none space-y-2 p-0 text-left">
            {STARTERS.map((starter, index) => (
              <li
                key={starter}
                className="flex items-start gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-3 text-[13.5px] font-semibold text-[var(--sf-ink)]/80"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[12px] font-extrabold"
                >
                  {index + 1}
                </span>
                {starter}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  } else {
    body = (
      <ol className="m-0 list-none p-0" aria-label="Committee messages">
        {messages.map((message, index) => {
          const own = isOwn(message);
          const previous = messages[index - 1];
          const grouped = previous != null && previous.senderId === message.senderId && previous.senderName === message.senderName;
          const label = senderLabel(message);
          const attachments = message.attachments ?? [];
          return (
            <motion.li
              key={message.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"} ${grouped ? "mt-1" : "mt-3"}`}
            >
              {!own ? (
                grouped ? (
                  <span className="w-8 shrink-0" aria-hidden="true" />
                ) : (
                  <MessagesAvatar name={label} color={colorForKey(message.senderId || message.senderName)} size="sm" />
                )
              ) : null}
              <div className={`flex max-w-[min(80%,28rem)] flex-col ${own ? "items-end" : "items-start"}`}>
                {!own && !grouped ? (
                  <span className="mb-1 px-1 text-[12px] font-extrabold text-[var(--sf-clay-deep)]">{label}</span>
                ) : null}
                <div
                  className={`rounded-[18px] px-3.5 py-2.5 ${
                    own
                      ? "rounded-br-[6px] bg-[var(--sf-clay)] text-white"
                      : "rounded-bl-[6px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white text-[var(--sf-ink)]"
                  }`}
                >
                  {message.text ? (
                    <LinkifiedText
                      as="p"
                      text={message.text}
                      className="m-0 whitespace-pre-wrap break-words text-[14.5px] leading-snug"
                      linkColor={own ? "rgba(255,255,255,0.95)" : "var(--sf-clay-deep)"}
                    />
                  ) : null}
                  {attachments.length > 0 ? (
                    // Image thumbnails open the shared fullscreen viewer; give them a
                    // Garden hover lift and focus ring (scoped here, shared component untouched).
                    <div className="[&_button.cursor-zoom-in]:rounded-xl [&_button.cursor-zoom-in]:transition-transform [&_button.cursor-zoom-in:hover]:-translate-y-0.5 [&_button.cursor-zoom-in:hover_img]:brightness-95 [&_button.cursor-zoom-in:focus-visible]:outline-none [&_button.cursor-zoom-in:focus-visible]:ring-4 [&_button.cursor-zoom-in:focus-visible]:ring-[var(--sf-clay)]/35">
                      <MessageAttachments
                        attachments={attachments}
                        C={composeTokens}
                        splitPane
                        isOwn={own}
                        resolveAttachmentUrl={resolveAttachmentUrl}
                      />
                    </div>
                  ) : null}
                </div>
                <span className="mt-1 px-1 text-[11.5px] font-semibold text-[var(--sf-soft)]">
                  {formatCommitteeMessageTime(message.createdAt ?? message.time)}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3 sm:px-8">
        <GIcon size="sm">
          <MessageCircle />
        </GIcon>
        <div className="min-w-0 flex-1">
          <GKicker>Committee chat</GKicker>
          <h2 className="sf-display m-0 truncate text-[1.2rem] leading-tight text-[var(--sf-ink)]">{committee.name}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-[var(--sf-soft)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          {activeMembers.length} {activeMembers.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--sf-paper)] px-4 py-5 sm:px-8"
        ref={listRef}
        data-testid={panelTestId}
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        <div ref={contentRef} className="flex flex-1 flex-col">
        {body}
        <p
          aria-live="polite"
          className={`m-0 mt-1.5 flex items-center justify-end gap-1 text-[11.5px] font-bold text-[var(--sf-soft)] ${
            showSent ? "" : "sr-only"
          }`}
        >
          {showSent ? (
            <>
              <Tick className="h-4 w-4" color="var(--sf-forest)" fill="var(--sf-mint)" />
              Sent
            </>
          ) : null}
        </p>
        </div>
      </div>

      <GardenComposer
        value={text}
        onChange={onTextChange}
        files={files}
        onFilesChange={onFilesChange}
        onSend={onSend}
        sending={sending}
        readOnly={readOnly}
        recipientName={committee.name}
        hasMessages={messages.length > 0}
        notify={notify}
        textareaRef={composerRef}
      />
    </div>
  );
}
