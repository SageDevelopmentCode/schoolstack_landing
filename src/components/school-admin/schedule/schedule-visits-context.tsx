"use client";

import { createContext, useContext } from "react";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import type { ScheduleVisitsData } from "@/lib/school-admin/load-schedule-visits-data";

export type ScheduleVisitsContextValue = {
  visits: AdminScheduledVisit[];
  visitsReady: boolean;
  hydrateVisits: (data: ScheduleVisitsData) => void;
  refetchVisits: () => Promise<void>;
};

export const ScheduleVisitsContext = createContext<ScheduleVisitsContextValue | null>(
  null,
);

export function useScheduleVisitsContext() {
  const context = useContext(ScheduleVisitsContext);
  if (!context) {
    throw new Error("useScheduleVisitsContext must be used within SchedulePageShell");
  }
  return context;
}

export function useOptionalScheduleVisitsContext() {
  return useContext(ScheduleVisitsContext);
}
