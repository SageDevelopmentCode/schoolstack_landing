"use client";

import { createContext, useContext } from "react";
import type { MessageThreadSummary } from "@/lib/messages/types";

type ParentMessagesPageContextValue = {
  hydrateThreads: (threads: MessageThreadSummary[], guardianId: string | null) => void;
};

export const ParentMessagesPageContext =
  createContext<ParentMessagesPageContextValue | null>(null);

export function useParentMessagesPageContext() {
  const context = useContext(ParentMessagesPageContext);
  if (!context) {
    throw new Error("useParentMessagesPageContext must be used within ParentMessagesPageShell");
  }
  return context;
}
