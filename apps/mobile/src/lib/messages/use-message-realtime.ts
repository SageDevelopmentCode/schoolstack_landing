import { useEffect, useRef } from 'react';

import { getSupabaseClient } from '@/lib/supabase';

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
  const onInboxChangeRef = useRef(onInboxChange);
  const onThreadMessageRef = useRef(onThreadMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);

  onInboxChangeRef.current = onInboxChange;
  onThreadMessageRef.current = onThreadMessage;
  onConnectionChangeRef.current = onConnectionChange;

  useEffect(() => {
    if (!enabled || !organizationId) return undefined;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`portal-messages:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_messages',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: { new: { thread_id?: string } }) => {
          const threadId = String((payload.new as { thread_id?: string }).thread_id ?? '');
          if (!threadId) return;
          onInboxChangeRef.current();
          onThreadMessageRef.current(threadId);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_threads',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          onInboxChangeRef.current();
        },
      )
      .subscribe((status: string) => {
        const onConnection = onConnectionChangeRef.current;
        if (!onConnection) return;
        if (status === 'SUBSCRIBED') {
          onConnection(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          onConnection(false);
        }
      });

    return () => {
      onConnectionChangeRef.current?.(false);
      void supabase.removeChannel(channel);
    };
  }, [enabled, organizationId]);
}
