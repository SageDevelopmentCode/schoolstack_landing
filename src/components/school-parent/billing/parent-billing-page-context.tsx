"use client";

import { createContext, useContext } from "react";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import type { ParentBillingPageMeta } from "@/lib/tuition/parent-billing-page-meta";

type ParentBillingPageContextValue = {
  hydrateBillingData: (data: ParentBillingInitialData) => void;
  hydrateMeta: (meta: ParentBillingPageMeta) => void;
};

export const ParentBillingPageContext =
  createContext<ParentBillingPageContextValue | null>(null);

export function useParentBillingPageContext() {
  const context = useContext(ParentBillingPageContext);
  if (!context) {
    throw new Error("useParentBillingPageContext must be used within ParentBillingPageShell");
  }
  return context;
}
