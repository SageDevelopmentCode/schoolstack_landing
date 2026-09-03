"use client";

import { useLayoutEffect } from "react";
import type { ScheduleVisitsData } from "@/lib/school-admin/load-schedule-visits-data";
import { useScheduleVisitsContext } from "./schedule-visits-context";

type ScheduleVisitsDataProps = {
  visitsData: ScheduleVisitsData;
};

export default function ScheduleVisitsData({
  visitsData,
}: ScheduleVisitsDataProps) {
  const { hydrateVisits } = useScheduleVisitsContext();

  useLayoutEffect(() => {
    hydrateVisits(visitsData);
  }, [hydrateVisits, visitsData]);

  return null;
}
