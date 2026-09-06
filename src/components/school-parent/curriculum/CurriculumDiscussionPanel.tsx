"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import { formatChatDayLabel } from "@/lib/messages/format-chat";
import { colorForKey } from "@/lib/messages/format";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessagesComposeBar from "@/components/messages/MessagesComposeBar";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { createClient } from "@/utils/supabase/client";

type CurriculumDiscussionPanelProps = {
  organizationId: string;
  programId: string;
  initialMessages: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

type DiscussionDayGroup = {
  dayKey: string;
  dayLabel: string;
  messages: ProgramCoopCurriculumDiscussionMessage[];
};

function mergeDiscussionMessages(
  existing: ProgramCoopCurriculumDiscussionMessage[],
  incoming: ProgramCoopCurriculumDiscussionMessage[],
): ProgramCoopCurriculumDiscussionMessage[] {
  const map = new Map<string, ProgramCoopCurriculumDiscussionMessage>();
  for (const message of existing) {
    map.set(message.id, message);
  }
  for (const message of incoming) {
    map.set(message.id, message);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

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
  initialMessages,
  currentGuardianId = null,
  previewMode = false,
}: CurriculumDiscussionPanelProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const [messages, setMessages] = useState(initialMessages);
  const [prevInitialMessages, setPrevInitialMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages);
  }

  const dayGroups = useMemo(() => groupDiscussionMessagesByDay(messages), [messages]);

  const refreshMessages = useCallback(async () => {
    if (!organizationId || !programId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ organizationId, programId });
      const response = await fetch(`/api/parent-portal/curriculum-discussion?${params}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load discussion.");
      }
      setMessages(data.messages ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discussion.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, programId]);

  useEffect(() => {
    if (!organizationId || !programId || previewMode) return undefined;

    const supabase = createClient();
    const channel = supabase
      .channel(`curriculum-discussion:${programId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "program_coop_curriculum_discussion_messages",
          filter: `program_id=eq.${programId}`,
        },
        () => {
          void refreshMessages();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [organizationId, previewMode, programId, refreshMessages]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || previewMode || sending) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/parent-portal/curriculum-discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          programId,
          body: trimmed,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send message.");
      }
      if (data.message) {
        setMessages((current) => mergeDiscussionMessages(current, [data.message]));
      }
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border"
      style={{ borderColor: theme.line }}
      data-testid="curriculum-discussion-panel"
    >
      <div
        className="shrink-0 border-b px-3 py-2"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.paper,
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Co-op discussion
        </p>
        <p className="truncate text-xs" style={{ color: theme.muted }}>
          Chat with other families in your co-op
        </p>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
        style={{ backgroundColor: theme.paper }}
      >
        {loading && messages.length === 0 ? (
          <div
            className="flex items-center justify-center gap-2 py-4 text-sm"
            style={{ color: theme.muted }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading discussion…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <MessageSquare className="h-6 w-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                Start the conversation
              </p>
              <p className="mt-1 max-w-[220px] text-xs leading-relaxed" style={{ color: theme.muted }}>
                Ask about this week&apos;s lessons or share a tip with the group.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {dayGroups.map((group) => (
              <div key={group.dayKey} className="space-y-3">
                <div className="flex justify-center py-1">
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{
                      backgroundColor: theme.white,
                      border: `1px solid ${theme.line}`,
                      color: theme.muted,
                    }}
                  >
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
                      className={`flex items-start gap-2.5 ${
                        isOwn ? "flex-row-reverse" : ""
                      }`}
                    >
                      <MessagesAvatar
                        name={message.senderDisplayName}
                        color={colorForKey(colorKey)}
                        photoUrl={message.profilePhotoUrl}
                        size="sm"
                      />
                      <div
                        className="max-w-[min(75%,28rem)] rounded-2xl px-3.5 py-2.5"
                        style={{
                          backgroundColor: isOwn ? theme.primary : theme.white,
                          border: isOwn ? undefined : `1px solid ${theme.line}`,
                        }}
                      >
                        <p
                          className="mb-1 text-xs font-semibold"
                          style={{
                            color: isOwn ? "rgba(255,255,255,0.75)" : theme.primary,
                          }}
                        >
                          {message.senderDisplayName}
                        </p>
                        {familySubtitle ? (
                          <p
                            className="mb-1 text-[10px] font-medium"
                            style={{
                              color: isOwn ? "rgba(255,255,255,0.65)" : theme.muted,
                            }}
                          >
                            {familySubtitle}
                          </p>
                        ) : null}
                        {message.pageNumber ? (
                          <p
                            className="mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: isOwn
                                ? "rgba(255,255,255,0.2)"
                                : theme.primarySoft,
                              color: isOwn ? "#ffffff" : theme.primary,
                            }}
                          >
                            Page {message.pageNumber}
                          </p>
                        ) : null}
                        <p
                          className="whitespace-pre-wrap text-sm"
                          style={{ color: isOwn ? "#ffffff" : theme.ink }}
                        >
                          {message.body}
                        </p>
                        <p
                          className={`mt-1 text-right text-[10px] ${
                            isOwn ? "text-white/70" : ""
                          }`}
                          style={isOwn ? undefined : { color: theme.muted }}
                        >
                          {formatRelativeTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <p className="shrink-0 px-3 pb-1 text-[13px]" style={{ color: theme.alert }}>
          {error}
        </p>
      ) : null}

      <MessagesComposeBar
        value={text}
        onChange={setText}
        files={[]}
        onFilesChange={() => {}}
        onSend={() => void handleSend()}
        sending={sending}
        disabled={previewMode}
        C={C}
        theme={theme}
        variant="parent-story"
        hideAttachments
        placeholder={
          previewMode
            ? "Preview mode — sending disabled"
            : "Ask the co-op a question or share a tip…"
        }
      />
    </div>
  );
}
