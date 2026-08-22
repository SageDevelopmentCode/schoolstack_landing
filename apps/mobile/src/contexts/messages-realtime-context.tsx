import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useMessageRealtime } from '@/lib/messages/use-message-realtime';

type MessagesInboxRealtimeConsumer = {
  activeThreadId: string | null;
  onInboxChange: () => void;
  onThreadMessage: (threadId: string) => void;
};

type MessagesRealtimeContextValue = {
  notifyMessagesUpdated: () => void;
  subscribeMessagesUpdated: (listener: () => void) => () => void;
  registerInboxConsumer: (consumer: MessagesInboxRealtimeConsumer) => () => void;
  realtimeConnected: boolean;
};

const MessagesRealtimeContext = createContext<MessagesRealtimeContextValue | null>(null);

export function MessagesRealtimeProvider({
  organizationId,
  enabled = true,
  children,
}: {
  organizationId: string;
  enabled?: boolean;
  children: ReactNode;
}) {
  const listenersRef = useRef(new Set<() => void>());
  const inboxConsumerRef = useRef<MessagesInboxRealtimeConsumer | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const notifyMessagesUpdated = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  const subscribeMessagesUpdated = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const registerInboxConsumer = useCallback((consumer: MessagesInboxRealtimeConsumer) => {
    inboxConsumerRef.current = consumer;
    return () => {
      if (inboxConsumerRef.current === consumer) {
        inboxConsumerRef.current = null;
      }
    };
  }, []);

  const onInboxChange = useCallback(() => {
    notifyMessagesUpdated();
    inboxConsumerRef.current?.onInboxChange();
  }, [notifyMessagesUpdated]);

  const onThreadMessage = useCallback((threadId: string) => {
    const consumer = inboxConsumerRef.current;
    if (
      consumer &&
      consumer.activeThreadId &&
      consumer.activeThreadId === threadId
    ) {
      consumer.onThreadMessage(threadId);
    }
  }, []);

  useMessageRealtime({
    organizationId,
    enabled,
    onInboxChange,
    onThreadMessage,
    onConnectionChange: setRealtimeConnected,
  });

  const value = useMemo(
    () => ({
      notifyMessagesUpdated,
      subscribeMessagesUpdated,
      registerInboxConsumer,
      realtimeConnected,
    }),
    [
      notifyMessagesUpdated,
      registerInboxConsumer,
      realtimeConnected,
      subscribeMessagesUpdated,
    ],
  );

  return (
    <MessagesRealtimeContext.Provider value={value}>
      {children}
    </MessagesRealtimeContext.Provider>
  );
}

export function useMessagesRealtime(): MessagesRealtimeContextValue {
  const context = useContext(MessagesRealtimeContext);
  if (!context) {
    throw new Error('useMessagesRealtime must be used within MessagesRealtimeProvider');
  }
  return context;
}
