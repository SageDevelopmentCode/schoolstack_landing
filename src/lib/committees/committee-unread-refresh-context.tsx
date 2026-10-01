"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

type CommitteeUnreadRefreshContextValue = {
  notifyCommitteeUnreadChanged: () => void;
  subscribeCommitteeUnreadChanged: (listener: () => void) => () => void;
};

const CommitteeUnreadRefreshContext =
  createContext<CommitteeUnreadRefreshContextValue | null>(null);

export function CommitteeUnreadRefreshProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<() => void>());

  const notifyCommitteeUnreadChanged = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  const subscribeCommitteeUnreadChanged = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({
      notifyCommitteeUnreadChanged,
      subscribeCommitteeUnreadChanged,
    }),
    [notifyCommitteeUnreadChanged, subscribeCommitteeUnreadChanged],
  );

  return (
    <CommitteeUnreadRefreshContext.Provider value={value}>
      {children}
    </CommitteeUnreadRefreshContext.Provider>
  );
}

export function useCommitteeUnreadRefresh() {
  return useContext(CommitteeUnreadRefreshContext);
}
