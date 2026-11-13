"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, Mail, Plus } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GKicker, GSkeleton, G_FOCUS, gBtnPopSm } from "@/components/school-parent/garden/ui";
import MessageBubbleRow from "@/components/messages/MessageBubbleRow";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import type { MessagesInboxViewModel } from "@/components/messages/messages-inbox-view-model";
import { buildMessageRenderItems } from "@/lib/messages/format-chat";
import { colorForKey } from "@/lib/messages/format";
import {
  isMudKitchenSupportPlaceholder,
  MUDKITCHEN_SUPPORT_EMPTY_COPY,
  MUDKITCHEN_SUPPORT_LOGO_URL,
  threadHasPlatformSupport,
} from "@/lib/messages/platform-support";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageThreadSummary } from "@/lib/messages/types";
import GardenComposer from "./GardenComposer";
import {
  GardenAvatar,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB_LABEL,
  pluralize,
} from "./garden-messages-shared";

/* ------------------------------------------------------------------ */
/* Start here: no conversation selected                                */
/* ------------------------------------------------------------------ */

const START_STEPS = [
  {
    title: "Choose who to message",
    detail: "Open a conversation from your inbox, or start a new one.",
  },
  {
    title: "Write your message",
    detail: `Add up to ${MAX_ATTACHMENTS} files if you need to — PDFs or images, up to ${MAX_ATTACHMENT_MB_LABEL} each.`,
  },
  {
    title: "Send it",
    detail: "Press Enter or the send button. Your message appears in the conversation right away.",
  },
] as const;

function StartHere({
  onStart,
  startDisabled,
  readOnly,
  latestUnread,
  unreadCount,
  onOpenThread,
}: {
  onStart: () => void;
  startDisabled: boolean;
  readOnly: boolean;
  latestUnread: MessageThreadSummary | null;
  unreadCount: number;
  onOpenThread: (threadId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--sf-paper)]">
      <div className="m-auto w-full max-w-[460px] px-6 py-10">
        <GKicker>How messaging works</GKicker>
        <h2 className="sf-display m-0 mt-1.5 text-[1.6rem] leading-[1.05] text-[var(--sf-ink)]">
          Pick a conversation to get started
        </h2>

        {latestUnread ? (
          <button
            type="button"
            onClick={() => onOpenThread(latestUnread.id)}
            className={`group mt-5 flex w-full items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-butter)] p-3.5 text-left shadow-[0_10px_20px_-16px_rgba(43,36,29,0.55)] transition-transform hover:-translate-y-0.5 ${G_FOCUS}`}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]"
            >
              <Mail className="h-[18px] w-[18px] text-[var(--sf-clay-deep)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-extrabold text-[var(--sf-ink)]">
                {pluralize(unreadCount, "unread conversation")}
              </span>
              <span className="block truncate text-[13px] font-semibold text-[var(--sf-ink)]/70">
                Latest: {latestUnread.title}
                {latestUnread.lastMessagePreview ? ` — ${latestUnread.lastMessagePreview}` : ""}
              </span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/70 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        ) : null}

        <ol className="m-0 mt-5 list-none space-y-2.5 p-0" aria-label="Steps">
          {START_STEPS.map((step, index) => (
            <li
              key={step.title}
              aria-current={index === 0 ? "step" : undefined}
              className={`flex items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 ${
                index === 0
                  ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]"
                  : "border-[var(--sf-ink)]/10 bg-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[13px] font-extrabold ${
                  index === 0 ? "bg-[var(--sf-clay)] text-white" : "bg-white text-[var(--sf-ink)]"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold text-[var(--sf-soft)]">
                  {step.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className={gBtnPopSm} onClick={onStart} disabled={startDisabled || readOnly}>
            <Plus className="h-4 w-4" aria-hidden />
            Start a new conversation
          </button>
          {readOnly ? (
            <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
              Preview mode — sending disabled
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thread                                                             */
/* ------------------------------------------------------------------ */

function ThreadSkeleton() {
  return (
    <div role="status" aria-label="Loading messages" className="space-y-4 py-2">
      {[["w-2/3", "start"], ["w-1/2", "end"], ["w-3/5", "start"], ["w-2/5", "end"]].map(
        ([width, side], index) => (
          <div key={index} className={`flex ${side === "end" ? "justify-end" : "justify-start"} gap-2`}>
            {side === "start" ? <GSkeleton className="h-8 w-8 shrink-0 !rounded-full" /> : null}
            <GSkeleton className={`h-14 ${width} !rounded-[20px]`} />
          </div>
        ),
      )}
    </div>
  );
}

export default function GardenThreadPane({
  model,
  C,
  composerRef,
  unreadThreads,
}: {
  model: MessagesInboxViewModel;
  C: AdminThemeTokens;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  unreadThreads: MessageThreadSummary[];
}) {
  const reduce = useReducedMotion() === true;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { activeThread: thread, actions } = model;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [thread?.messages, thread?.id, reduce]);

  if (!thread) {
    return (
      <StartHere
        onStart={actions.openNewConversation}
        startDisabled={model.newMessageDisabled}
        readOnly={model.readOnly}
        latestUnread={unreadThreads[0] ?? null}
        unreadCount={unreadThreads.length}
        onOpenThread={actions.selectThread}
      />
    );
  }

  const supportThread =
    isMudKitchenSupportPlaceholder(thread.id) || threadHasPlatformSupport(thread.participants);
  const renderItems = buildMessageRenderItems(thread.messages);
  const lastMessage = thread.messages.at(-1);
  const showSent =
    lastMessage != null && lastMessage.isOwn && !lastMessage.pending && !lastMessage.deletedAt;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-3 sm:px-5">
        <button
          type="button"
          onClick={actions.backToList}
          className={`-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/75 hover:bg-[var(--sf-ink)]/[0.05] md:hidden ${G_FOCUS} focus-visible:ring-offset-0`}
          aria-label="Back to conversations"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <GardenAvatar
          name={thread.title}
          color={thread.color}
          photoUrl={thread.photoUrl}
          listAvatars={thread.listAvatars}
          supportLogo={supportThread}
        />
        <div className="min-w-0 flex-1">
          <h2 className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)] sm:text-[1.25rem]">
            {thread.title}
          </h2>
          {thread.subtitle ? (
            <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">
              {thread.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--sf-paper)] px-3 py-4 sm:px-6"
        aria-busy={model.loadingMessages || undefined}
      >
        {model.loadingMessages ? (
          <ThreadSkeleton />
        ) : thread.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex max-w-sm flex-col items-center rounded-[20px] bg-[var(--sf-mint)] px-6 py-7 text-center"
            >
              <GardenAvatar
                name={thread.title}
                color={thread.color}
                photoUrl={thread.photoUrl}
                listAvatars={thread.listAvatars}
                supportLogo={supportThread}
                size="lg"
              />
              <p className="m-0 mt-3 text-[16px] font-extrabold text-[var(--sf-ink)]">
                Say hello to {thread.title}
              </p>
              <p className="m-0 mt-1 text-[13.5px] font-semibold text-[var(--sf-ink)]/70">
                {supportThread ? MUDKITCHEN_SUPPORT_EMPTY_COPY : "Send a message to start the conversation."}
              </p>
              <span aria-hidden="true" className="sf-hand mt-2 block text-lg text-[var(--sf-forest)]">
                a little hello goes a long way ✿
              </span>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[760px] flex-col">
            {renderItems.map((item, index) => {
              if (item.type === "day") {
                return (
                  <div key={`day-${item.dayKey}`} className="flex justify-center py-3 first:pt-0">
                    <span className="rounded-full border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[var(--sf-soft)]">
                      {item.dayLabel}
                    </span>
                  </div>
                );
              }
              const { message, showSenderName, isGroupedWithPrevious } = item;
              const isSupportLogo = message.profilePhotoUrl === MUDKITCHEN_SUPPORT_LOGO_URL;
              const previous = renderItems[index - 1];
              const tight = isGroupedWithPrevious && previous?.type === "message";
              return (
                <motion.div
                  key={message.id}
                  layout={reduce ? false : "position"}
                  initial={reduce || !message.pending ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"} ${tight ? "mt-1" : "mt-3"}`}
                >
                  <MessageBubbleRow
                    message={message}
                    C={C}
                    splitPane
                    parentStory={false}
                    ownBubble={Boolean(message.isOwn)}
                    readOnly={model.readOnly}
                    showSenderName={showSenderName}
                    senderLabel={message.senderName}
                    onEditMessage={actions.editMessage}
                    onRequestDelete={actions.requestDelete}
                    garden
                    avatar={
                      message.isOwn ? undefined : tight ? (
                        <span className="w-8 shrink-0" aria-hidden="true" />
                      ) : (
                        <MessagesAvatar
                          name={message.senderName}
                          color={colorForKey(message.senderUserId)}
                          photoUrl={message.profilePhotoUrl}
                          photoBackground={isSupportLogo ? "#FFFFFF" : undefined}
                          photoObjectFit={isSupportLogo ? "contain" : "cover"}
                          size="sm"
                        />
                      )
                    }
                  />
                </motion.div>
              );
            })}
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
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <GardenComposer
        value={model.input}
        onChange={actions.setInput}
        files={model.stagedFiles}
        onFilesChange={actions.setStagedFiles}
        onSend={actions.send}
        sending={model.sending}
        readOnly={model.readOnly}
        recipientName={thread.title}
        hasMessages={thread.messages.length > 0}
        notify={actions.notify}
        textareaRef={composerRef}
      />
    </div>
  );
}
