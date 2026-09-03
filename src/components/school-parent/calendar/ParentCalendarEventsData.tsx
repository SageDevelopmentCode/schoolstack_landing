"use client";

import { useLayoutEffect } from "react";
import type { ParentCalendarInitialData } from "@/lib/school-events/types";
import { useParentCalendarPageContext } from "./parent-calendar-page-context";

type ParentCalendarEventsDataProps = {
  initialData: ParentCalendarInitialData;
};

export default function ParentCalendarEventsData({
  initialData,
}: ParentCalendarEventsDataProps) {
  const { hydrateEvents } = useParentCalendarPageContext();

  useLayoutEffect(() => {
    hydrateEvents(initialData.events);
  }, [hydrateEvents, initialData.events]);

  return null;
}
