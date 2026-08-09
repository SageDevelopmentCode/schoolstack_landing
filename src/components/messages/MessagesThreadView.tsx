"use client";

import { ChevronLeft, FileText } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { buildMessageRenderItems } from "@/lib/messages/format-chat";
import type { MessageThreadDetail } from "@/lib/messages/types";
import MessagesAvatar, { type MessagesLayoutVariant } from "./MessagesAvatar";
import MessagesComposeBar from "./MessagesComposeBar";
import MessagesThreadSkeleton from "./MessagesThreadSkeleton";

function MessageAttachments({
  attachments,
  C,
  embedded,
  isOwn,
}: {
  attachments: MessageThreadDetail["messages"][number]["attachments"];
  C: AdminThemeTokens;
  embedded: boolean;
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
                  embedded ? "rounded-xl" : "rounded-lg border"
                }`}
                style={embedded ? undefined : { borderColor: C.border }}
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
              embedded && isOwn ? "text-white/90" : ""
            }`}
            style={embedded && isOwn ? undefined : { color: C.accent }}
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
  variant = "card",
  onBack,
  loadingMessages = false,
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
  variant?: MessagesLayoutVariant;
  onBack?: () => void;
  loadingMessages?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const embedded = variant === "embedded";
  const chatBackground = C.bg;

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
        className={`shrink-0 border-b px-4 py-3 ${
          embedded ? "bg-white" : ""
        }`}
        style={{ borderColor: C.border, backgroundColor: embedded ? C.bg : C.surface }}
      >
        <div className="flex items-center gap-3">
          {embedded && onBack ? (
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
          {embedded ? (
            <MessagesAvatar name={thread.title} color={thread.color} size="lg" />
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
              {thread.title}
            </p>
            {thread.subtitle && (
              <p className="text-xs truncate" style={{ color: C.textTertiary }}>
                {thread.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: chatBackground }}
      >
        {loadingMessages ? (
          <MessagesThreadSkeleton C={C} embedded={embedded} />
        ) : thread.messages.length === 0 ? (
          embedded ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <MessagesAvatar name={thread.title} color={thread.color} size="lg" />
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
          <div className="space-y-3">
            {renderItems.map((item) => {
              if (item.type === "day") {
                return (
                  <div key={`day-${item.dayKey}`} className="flex justify-center py-1">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-medium shadow-sm"
                      style={{
                        backgroundColor: embedded ? "rgba(255,255,255,0.92)" : C.surface,
                        color: C.textTertiary,
                      }}
                    >
                      {item.dayLabel}
                    </span>
                  </div>
                );
              }

              const { message, showSenderName, isGroupedWithPrevious } = item;
              const ownBubble = embedded && message.isOwn;

              return (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"} ${
                    isGroupedWithPrevious ? "-mt-2" : ""
                  }`}
                >
                  <div
                    className={`max-w-[min(75%,28rem)] ${
                      embedded
                        ? message.isOwn
                          ? "rounded-2xl rounded-br-md px-3 py-2 shadow-sm"
                          : "rounded-2xl rounded-bl-md px-3 py-2 shadow-sm"
                        : "p-3 rounded-xl border"
                    }`}
                    style={
                      embedded
                        ? {
                            backgroundColor: message.isOwn ? C.accent : C.surface,
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
                        className="text-xs font-semibold mb-1"
                        style={{ color: embedded ? C.accent : C.textPrimary }}
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
                      embedded={embedded}
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

      <MessagesComposeBar
        value={input}
        onChange={onInputChange}
        files={files}
        onFilesChange={onFilesChange}
        onSend={onSend}
        sending={sending}
        disabled={readOnly}
        C={C}
        variant={variant}
      />
    </div>
  );
}
