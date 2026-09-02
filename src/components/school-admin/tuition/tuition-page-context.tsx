"use client";

import { createContext, useContext } from "react";
import type { TuitionDashboardData } from "@/lib/tuition/load-tuition-dashboard-data";

type TuitionPageContextValue = {
  hydrateDashboard: (data: TuitionDashboardData) => void;
};

export const TuitionPageContext = createContext<TuitionPageContextValue | null>(null);

export function useTuitionPageContext() {
  const context = useContext(TuitionPageContext);
  if (!context) {
    throw new Error("useTuitionPageContext must be used within TuitionPageShell");
  }
  return context;
}
