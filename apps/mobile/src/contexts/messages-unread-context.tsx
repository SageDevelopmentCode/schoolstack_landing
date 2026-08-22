import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type MessagesUnreadContextValue = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
};

const MessagesUnreadContext = createContext<MessagesUnreadContextValue | null>(null);

type MessagesUnreadProviderProps = {
  children: ReactNode;
  organizationId: string;
  schoolName: string;
  fetchUnreadCount: (organizationId: string, schoolName: string) => Promise<number>;
};

export function MessagesUnreadProvider({
  children,
  organizationId,
  schoolName,
  fetchUnreadCount,
}: MessagesUnreadProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount(organizationId, schoolName);
      setUnreadCount(count);
    } catch {
      // Keep last known count on transient failures.
    }
  }, [fetchUnreadCount, organizationId, schoolName]);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      refreshUnreadCount,
    }),
    [refreshUnreadCount, unreadCount],
  );

  return (
    <MessagesUnreadContext.Provider value={value}>{children}</MessagesUnreadContext.Provider>
  );
}

export function useMessagesUnread(): MessagesUnreadContextValue {
  const context = useContext(MessagesUnreadContext);
  if (!context) {
    throw new Error('useMessagesUnread must be used within MessagesUnreadProvider');
  }
  return context;
}

export function useOptionalMessagesUnread(): MessagesUnreadContextValue | null {
  return useContext(MessagesUnreadContext);
}
