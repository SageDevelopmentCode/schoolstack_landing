"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee } from "@/lib/committees/types";
import { postMessage } from "@/lib/committees/messages";
import { getCommittee } from "@/lib/committees/committees";

export default function CommitteeMessagesSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await postMessage(supabase, committee.id, text.trim());
      setText("");
      const updated = await getCommittee(supabase, organizationId, committee.id);
      if (updated) onCommitteeChange(updated);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {committee.messages.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: C.textTertiary }}>
            No messages yet. Start the conversation.
          </p>
        ) : (
          committee.messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl border max-w-lg"
              style={{ backgroundColor: C.surface, borderColor: C.border }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {msg.senderName}
                </p>
                <p className="text-[10px]" style={{ color: C.textTertiary }}>
                  {msg.time}
                </p>
              </div>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>
      <div
        className="shrink-0 border-t p-4 flex gap-2"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a message…"
          className="flex-1 px-3 py-2 text-sm rounded-lg border"
          style={{ borderColor: C.border, color: C.textPrimary }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="px-3 py-2 rounded-lg text-white cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: C.accent }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
