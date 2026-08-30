"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

type AdminNotificationsPanelContextValue = {
  openNotifications: () => void;
};

const AdminNotificationsPanelContext =
  createContext<AdminNotificationsPanelContextValue | null>(null);

export function AdminNotificationsPanelProvider({
  onOpenNotifications,
  children,
}: {
  onOpenNotifications: () => void;
  children: ReactNode;
}) {
  const openNotifications = useCallback(() => {
    onOpenNotifications();
  }, [onOpenNotifications]);

  const value = useMemo(
    () => ({ openNotifications }),
    [openNotifications],
  );

  return (
    <AdminNotificationsPanelContext.Provider value={value}>
      {children}
    </AdminNotificationsPanelContext.Provider>
  );
}

export function useAdminNotificationsPanel() {
  const context = useContext(AdminNotificationsPanelContext);
  if (!context) {
    throw new Error(
      "useAdminNotificationsPanel must be used within AdminNotificationsPanelProvider",
    );
  }
  return context;
}
