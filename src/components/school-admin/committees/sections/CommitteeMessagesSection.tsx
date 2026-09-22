"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { postMessage } from "@/lib/committees/messages";
import { getCommittee } from "@/lib/committees/committees";
import {
  formatCommitteeAttribution,
  SCHOOL_ADMIN_ATTRIBUTION,
} from "@/lib/committees/attribution";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { committeeOperationalSurface } from "@/components/school-admin/committees/CommitteeAttributionLabel";

export default function CommitteeMessagesSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  currentMemberId,
  isAdmin = true,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  currentMemberId?: string;
  isAdmin?: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputStyle = committeeStoryInputStyle(theme);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await postMessage(
        supabase,
        committee.id,
        text.trim(),
        currentMemberId,
      );
      setText("");
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
    <CommitteeWorkspaceSectionFrame width="narrow">
      <ParentCard theme={theme} className="!overflow-hidden !p-0">
        <div
          className="max-h-[min(480px,50vh)] overflow-y-auto p-4 sm:p-5"
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
            <div className="space-y-3">
              {committee.messages.map((msg) => {
                const attribution =
                  msg.senderRole != null
                    ? formatCommitteeAttribution({
                        name: msg.senderName,
                        role: msg.senderRole,
                      })
                    : msg.senderName === SCHOOL_ADMIN_ATTRIBUTION
                      ? SCHOOL_ADMIN_ATTRIBUTION
                      : msg.senderName;
                return (
                  <div
                    key={msg.id}
                    className="rounded-xl border p-3 sm:p-4"
                    style={{ backgroundColor: theme.primarySoft, borderColor: theme.line }}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold" style={{ color: theme.ink }}>
                        {attribution}
                      </p>
                      <p className="text-[10px]" style={{ color: theme.muted }}>
                        {msg.time}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {!readOnly && (
          <div
            className="flex items-center gap-2 border-t p-4 sm:gap-3 sm:p-5"
            style={{ borderColor: theme.line, backgroundColor: theme.white }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Write a message…"
              className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
              style={inputStyle}
            />
            <AdminButton
              theme={theme}
              variant="primary"
              onClick={() => void handleSend()}
              disabled={sending || !text.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </AdminButton>
          </div>
        )}
      </ParentCard>
    </CommitteeWorkspaceSectionFrame>
  );
}
