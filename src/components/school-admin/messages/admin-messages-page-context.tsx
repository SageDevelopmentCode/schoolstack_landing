"use client";

import { createContext, useContext } from "react";
import type { MessageThreadSummary } from "@/lib/messages/types";

type AdminMessagesPageContextValue = {
  hydrateThreads: (threads: MessageThreadSummary[]) => void;
};

export const AdminMessagesPageContext = createContext<AdminMessagesPageContextValue | null>(
  null,
);

export function useAdminMessagesPageContext() {
  const context = useContext(AdminMessagesPageContext);
  if (!context) {
    throw new Error(
      "useAdminMessagesPageContext must be used within AdminMessagesPageShell",
    );
  }
  return context;
}
