"use client";

import { createContext, useContext } from "react";
import type { OrganizationEvent } from "@/lib/school-events/types";

type ParentCalendarPageContextValue = {
  hydrateEvents: (events: OrganizationEvent[]) => void;
};

export const ParentCalendarPageContext =
  createContext<ParentCalendarPageContextValue | null>(null);

export function useParentCalendarPageContext() {
  const context = useContext(ParentCalendarPageContext);
  if (!context) {
    throw new Error("useParentCalendarPageContext must be used within ParentCalendarPageShell");
  }
  return context;
}
