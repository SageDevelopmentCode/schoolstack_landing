"use client";

import { createContext, useContext } from "react";
import type { ParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";

type ParentHomePageContextValue = {
  hydrateHomeContent: (data: ParentHomeContentData) => void;
};

export const ParentHomePageContext = createContext<ParentHomePageContextValue | null>(null);

export function useParentHomePageContext() {
  const context = useContext(ParentHomePageContext);
  if (!context) {
    throw new Error("useParentHomePageContext must be used within ParentHomePageShell");
  }
  return context;
}
