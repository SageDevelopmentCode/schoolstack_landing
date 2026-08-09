"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type UseMessageRealtimeOptions = {
  organizationId: string;
  activeThreadId: string | null;
  enabled?: boolean;
  onThreadMessage: (threadId: string) => void;
  onInboxChange: () => void;
};

export function useMessageRealtime({
  organizationId,
  activeThreadId,
  enabled = true,
  onThreadMessage,
  onInboxChange,
}: UseMessageRealtimeOptions) {
  useEffect(() => {
    if (!enabled || !organizationId) return undefined;

    const supabase = createClient();
    const channel = supabase
      .channel(`portal-messages:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portal_messages",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: { new: { thread_id?: string } }) => {
          const threadId = String(
            (payload.new as { thread_id?: string }).thread_id ?? "",
          );
          if (!threadId) return;
          onInboxChange();
          if (activeThreadId && threadId === activeThreadId) {
            onThreadMessage(threadId);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message_threads",
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          onInboxChange();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    activeThreadId,
    enabled,
    onInboxChange,
    onThreadMessage,
    organizationId,
  ]);
}
