"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessageAttachments from "@/components/messages/MessageAttachments";
import MessagesComposeBar from "@/components/messages/MessagesComposeBar";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { Committee, CommitteeMessage } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { postMessage } from "@/lib/committees/messages";
import { getCommittee } from "@/lib/committees/committees";
import {
  formatCommitteeAttribution,
  SCHOOL_ADMIN_ATTRIBUTION,
} from "@/lib/committees/attribution";
import { colorForKey } from "@/lib/messages/format";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { committeeOperationalSurface } from "@/components/school-admin/committees/CommitteeAttributionLabel";

function isOwnCommitteeMessage(
  msg: CommitteeMessage,
  currentMemberId?: string,
  isAdmin = true,
): boolean {
  if (currentMemberId && msg.senderId === currentMemberId) return true;
  if (isAdmin && !msg.senderId) return true;
  return false;
}

function senderLabel(msg: CommitteeMessage): string {
  if (msg.senderRole != null) {
    return formatCommitteeAttribution({
      name: msg.senderName,
      role: msg.senderRole,
    });
  }
  if (msg.senderName === SCHOOL_ADMIN_ATTRIBUTION) {
    return SCHOOL_ADMIN_ATTRIBUTION;
  }
  return msg.senderName;
}

function CommitteeMessageBubble({
  msg,
  theme,
  composeTokens,
  currentMemberId,
  isAdmin,
}: {
  msg: CommitteeMessage;
  theme: ParentThemeTokens;
  composeTokens: AdminThemeTokens;
  currentMemberId?: string;
  isAdmin: boolean;
}) {
  const own = isOwnCommitteeMessage(msg, currentMemberId, isAdmin);
  const label = senderLabel(msg);
  const avatarKey = msg.senderId || msg.senderName;
  const attachments = msg.attachments ?? [];

  return (
    <div
      className={`flex items-start gap-2 ${own ? "flex-row-reverse" : ""}`}
    >
      <MessagesAvatar
        name={label}
        color={colorForKey(avatarKey)}
        size="sm"
      />
      <div
        className="max-w-[min(78%,20rem)] rounded-2xl px-2.5 py-1.5"
        style={{
          backgroundColor: own ? theme.primary : theme.white,
          border: own ? undefined : `1px solid ${theme.line}`,
        }}
      >
        {!own ? (
          <p
            className="mb-0.5 text-[10px] font-semibold leading-snug"
            style={{ color: theme.primary }}
          >
            {label}
          </p>
        ) : null}
        {msg.text ? (
          <p
            className="whitespace-pre-wrap text-xs leading-snug"
            style={{ color: own ? "#ffffff" : theme.ink }}
          >
            {msg.text}
          </p>
        ) : null}
        {attachments.length > 0 ? (
          <MessageAttachments
            attachments={attachments}
            C={composeTokens}
            splitPane
            isOwn={own}
          />
        ) : null}
        <p
          className={`mt-0.5 text-right text-[10px] ${own ? "text-white/70" : ""}`}
          style={own ? undefined : { color: theme.muted }}
        >
          {msg.time}
        </p>
      </div>
    </div>
  );
}

export default function CommitteeMessagesSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  currentMemberId,
  isAdmin = true,
  composeTokens,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  currentMemberId?: string;
  isAdmin?: boolean;
  composeTokens: AdminThemeTokens;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [committee.messages]);

  const handleSend = async () => {
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    try {
      await postMessage(
        supabase,
        committee.id,
        text.trim(),
        currentMemberId,
        {
          organizationId,
          files,
        },
      );
      setText("");
      setFiles([]);
      const updated = await getCommittee(supabase, organizationId, committee.id);
      if (updated) onCommitteeChange(updated);
      adminToast.success("Message sent");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to send message."));
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.messages.send",
        error: "",
      }, err);
    } finally {
      setSending(false);
    }
  };

  return (
    <CommitteeWorkspaceSectionFrame
      width="narrow"
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <ParentCard
        theme={theme}
        className="flex h-full min-h-0 flex-1 flex-col !overflow-hidden !p-0"
      >
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-4"
          style={{ backgroundColor: theme.white }}
        >
          {committee.messages.length === 0 ? (
            <CommitteeSectionEmptyState
              theme={theme}
              icon={MessageCircle}
              title="No messages yet"
              description="Start the conversation with your committee. Share updates, questions, and coordination with other members."
              className="!border-0 !bg-transparent !shadow-none"
            />
          ) : (
            <div className="space-y-2">
              {committee.messages.map((msg) => (
                <CommitteeMessageBubble
                  key={msg.id}
                  msg={msg}
                  theme={theme}
                  composeTokens={composeTokens}
                  currentMemberId={currentMemberId}
                  isAdmin={isAdmin}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        {!readOnly && (
          <MessagesComposeBar
            value={text}
            onChange={setText}
            files={files}
            onFilesChange={setFiles}
            onSend={() => void handleSend()}
            sending={sending}
            C={composeTokens}
            theme={theme}
            variant="parent-story"
            placeholder="Write a message…"
          />
        )}
      </ParentCard>
    </CommitteeWorkspaceSectionFrame>
  );
}
