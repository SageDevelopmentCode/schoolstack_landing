"use client";

import { ChevronLeft, FileText } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { buildMessageRenderItems } from "@/lib/messages/format-chat";
import { colorForKey } from "@/lib/messages/format";
import type { MessageThreadDetail } from "@/lib/messages/types";
import MessagesAvatar, { type MessagesLayoutVariant } from "./MessagesAvatar";
import MessagesDualAvatar from "./MessagesDualAvatar";
import MessageStudentSubtitle from "./MessageStudentSubtitle";
import MessagesComposeBar from "./MessagesComposeBar";
import MessagesThreadSkeleton from "./MessagesThreadSkeleton";
import {
  isSplitPaneMessagesVariant,
  isStoryMessagesVariant,
} from "@/lib/messages/messages-layout-variant";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type MessagesComposeBanner =
  | { variant: "info"; message: string }
  | { variant: "warning"; message: string };

function MessageAttachments({
  attachments,
  C,
  splitPane,
  isOwn,
}: {
  attachments: MessageThreadDetail["messages"][number]["attachments"];
  C: AdminThemeTokens;
  splitPane: boolean;
  isOwn: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType?.startsWith("image/");
        if (isImage && attachment.url) {
          return (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={attachment.url}
                alt={attachment.fileName}
                width={240}
                height={180}
                unoptimized
                className={`max-h-48 w-auto object-cover ${
                  splitPane ? "rounded-xl" : "rounded-lg border"
                }`}
                style={splitPane ? undefined : { borderColor: C.border }}
              />
            </a>
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs underline ${
              splitPane && isOwn ? "text-white/90" : ""
            }`}
            style={splitPane && isOwn ? undefined : { color: C.accent }}
          >
            <FileText className="w-3.5 h-3.5" />
            {attachment.fileName}
          </a>
        );
      })}
    </div>
  );
}

export default function MessagesThreadView({
  thread,
  input,
  onInputChange,
  files,
  onFilesChange,
  onSend,
  sending,
  readOnly,
  C,
  theme,
  variant = "card",
  onBack,
  loadingMessages = false,
  composeBanner = null,
  onStudentClick,
  schoolName,
}: {
  thread: MessageThreadDetail | null;
  input: string;
  onInputChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
  sending: boolean;
  readOnly?: boolean;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  variant?: MessagesLayoutVariant;
  onBack?: () => void;
  loadingMessages?: boolean;
  composeBanner?: MessagesComposeBanner | null;
  onStudentClick?: (studentId: string) => void;
  schoolName?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const splitPane = isSplitPaneMessagesVariant(variant);
  const parentStory = isStoryMessagesVariant(variant);
  const chatBackground = parentStory
    ? "linear-gradient(180deg, #fafcf9, #f2f7f3)"
    : C.bg;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages, thread?.id]);

  if (!thread) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-6 text-sm"
        style={{ color: C.textSecondary, backgroundColor: chatBackground }}
      >
        Select a conversation to start messaging.
      </div>
    );
  }

  const renderItems = buildMessageRenderItems(thread.messages);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div
        className={`shrink-0 border-b px-4 py-3 ${splitPane ? "bg-white" : ""}`}
        style={{
          borderColor: theme?.line ?? C.border,
          backgroundColor: parentStory ? theme?.white ?? C.bg : splitPane ? C.bg : C.surface,
        }}
      >
        <div className="flex items-center gap-3">
          {splitPane && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer hover:bg-black/[0.04]"
              style={{ color: C.textSecondary }}
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : null}
          {splitPane ? (
            thread.listAvatars?.length === 2 ? (
              <MessagesDualAvatar avatars={thread.listAvatars} size="lg" />
            ) : (
              <MessagesAvatar
                name={thread.title}
                color={thread.color}
                photoUrl={thread.photoUrl}
                size="lg"
              />
            )
          ) : null}
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: theme?.ink ?? C.textPrimary }}
            >
              {thread.title}
            </p>
            {parentStory ? (
              thread.subtitle ? (
                <p className="truncate text-xs" style={{ color: theme?.muted ?? C.textSecondary }}>
                  {thread.subtitle}
                </p>
              ) : null
            ) : thread.subtitle || thread.subtitleStudents?.length ? (
              <MessageStudentSubtitle
                students={thread.subtitleStudents}
                subtitle={thread.subtitle}
                onStudentClick={onStudentClick}
                C={C}
                truncate
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: chatBackground }}
      >
        {loadingMessages ? (
          <MessagesThreadSkeleton C={C} embedded={splitPane} />
        ) : thread.messages.length === 0 ? (
          splitPane ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <MessagesAvatar
                name={thread.title}
                color={thread.color}
                photoUrl={thread.photoUrl}
                size="lg"
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Say hello to {thread.title}
                </p>
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  Send a message to start the conversation.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: C.textTertiary }}>
              No messages yet. Say hello.
            </p>
          )
        ) : (
          <div className={parentStory ? "space-y-4" : "space-y-3"}>
            {renderItems.map((item) => {
              if (item.type === "day") {
                return (
                  <div key={`day-${item.dayKey}`} className="flex justify-center py-1">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-medium"
                      style={
                        parentStory && theme
                          ? {
                              backgroundColor: theme.white,
                              border: `1px solid ${theme.line}`,
                              color: theme.muted,
                            }
                          : {
                              backgroundColor: splitPane ? "rgba(255,255,255,0.92)" : C.surface,
                              color: C.textTertiary,
                              boxShadow: splitPane ? undefined : undefined,
                            }
                      }
                    >
                      {item.dayLabel}
                    </span>
                  </div>
                );
              }

              const { message, showSenderName, isGroupedWithPrevious } = item;
              const ownBubble = splitPane && message.isOwn;
              const grouped = parentStory ? false : isGroupedWithPrevious;
              const senderLabel =
                parentStory && message.isOwn && schoolName
                  ? `${message.senderName} · ${schoolName}`
                  : message.senderName;
              const displaySenderName = parentStory ? true : showSenderName;

              if (parentStory && theme) {
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${
                      message.isOwn ? "flex-row-reverse" : ""
                    }`}
                  >
                    <MessagesAvatar
                      name={message.senderName}
                      color={colorForKey(message.senderUserId)}
                      photoUrl={message.profilePhotoUrl}
                      size="sm"
                    />
                    <div
                      className="max-w-[min(75%,28rem)] rounded-2xl px-3.5 py-2.5"
                      style={{
                        backgroundColor: message.isOwn ? theme.primary : theme.white,
                        border: message.isOwn ? undefined : `1px solid ${theme.line}`,
                        opacity: message.pending ? 0.75 : 1,
                      }}
                    >
                      {displaySenderName ? (
                        <p
                          className="mb-1 text-xs font-semibold"
                          style={{ color: message.isOwn ? "#ffffff" : theme.ink }}
                        >
                          {senderLabel}
                        </p>
                      ) : null}
                      {message.body ? (
                        <p
                          className="whitespace-pre-wrap text-sm"
                          style={{ color: message.isOwn ? "#ffffff" : theme.ink }}
                        >
                          {message.body}
                        </p>
                      ) : null}
                      <MessageAttachments
                        attachments={message.attachments}
                        C={C}
                        splitPane={splitPane}
                        isOwn={message.isOwn}
                      />
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          message.isOwn ? "text-white/70" : ""
                        }`}
                        style={message.isOwn ? undefined : { color: theme.muted }}
                      >
                        {message.pending ? "Sending…" : message.timeLabel}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"} ${
                    grouped ? "-mt-2" : ""
                  }`}
                >
                  <div
                    className={`max-w-[min(75%,28rem)] ${
                      splitPane
                        ? message.isOwn
                          ? "rounded-2xl rounded-br-md px-3 py-2 shadow-sm"
                          : "rounded-2xl rounded-bl-md px-3 py-2 shadow-sm"
                        : "rounded-xl border p-3"
                    }`}
                    style={
                      splitPane
                        ? {
                            backgroundColor: message.isOwn
                              ? theme?.primary ?? C.accent
                              : theme?.white ?? C.surface,
                            opacity: message.pending ? 0.75 : 1,
                          }
                        : {
                            backgroundColor: message.isOwn ? `${C.accent}12` : C.surface,
                            borderColor: C.border,
                            opacity: message.pending ? 0.7 : 1,
                          }
                    }
                  >
                    {showSenderName && (
                      <p
                        className="mb-1 text-xs font-semibold"
                        style={{
                          color: parentStory
                            ? theme?.ink ?? C.textPrimary
                            : splitPane
                              ? C.accent
                              : C.textPrimary,
                        }}
                      >
                        {message.senderName}
                      </p>
                    )}
                    {message.body ? (
                      <p
                        className="text-sm whitespace-pre-wrap"
                        style={{
                          color: ownBubble ? "#ffffff" : C.textSecondary,
                        }}
                      >
                        {message.body}
                      </p>
                    ) : null}
                    <MessageAttachments
                      attachments={message.attachments}
                      C={C}
                      splitPane={splitPane}
                      isOwn={message.isOwn}
                    />
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        ownBubble ? "text-white/75" : ""
                      }`}
                      style={ownBubble ? undefined : { color: C.textTertiary }}
                    >
                      {message.pending ? "Sending…" : message.timeLabel}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {composeBanner ? (
        <div
          className="shrink-0 border-t px-4 py-2.5 text-xs leading-relaxed"
          style={{
            borderColor: C.border,
            backgroundColor:
              composeBanner.variant === "warning" ? C.warningBg : `${C.accent}10`,
            color: composeBanner.variant === "warning" ? C.warning : C.textSecondary,
          }}
        >
          {composeBanner.message}
        </div>
      ) : null}

      <MessagesComposeBar
        value={input}
        onChange={onInputChange}
        files={files}
        onFilesChange={onFilesChange}
        onSend={onSend}
        sending={sending}
        disabled={readOnly}
        C={C}
        theme={theme}
        variant={variant}
      />
    </div>
  );
}
