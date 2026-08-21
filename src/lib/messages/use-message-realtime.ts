"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type UseMessageRealtimeOptions = {
  organizationId: string;
  enabled?: boolean;
  onThreadMessage: (threadId: string) => void;
  onInboxChange: () => void;
  onConnectionChange?: (connected: boolean) => void;
};

export function useMessageRealtime({
  organizationId,
  enabled = true,
  onThreadMessage,
  onInboxChange,
  onConnectionChange,
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
          onThreadMessage(threadId);
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
      .subscribe((status: string) => {
        if (!onConnectionChange) return;
        if (status === "SUBSCRIBED") {
          onConnectionChange(true);
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          onConnectionChange(false);
        }
      });

    return () => {
      onConnectionChange?.(false);
      void supabase.removeChannel(channel);
    };
  }, [enabled, onConnectionChange, onInboxChange, onThreadMessage, organizationId]);
}
