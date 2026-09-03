import { cookies } from "next/headers";
import {
  calendarEventWindowForMonth,
  calendarEventWindowForToday,
} from "./calendar-window";
import { listEventsForOrg } from "./events";
import type { ParentCalendarInitialData } from "./types";
import { createClient } from "@/utils/supabase/server";

export async function loadParentCalendarInitialData(input: {
  organizationId: string;
  year?: number;
  month?: number;
}): Promise<ParentCalendarInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const referenceDate = new Date();
  const year = input.year ?? referenceDate.getFullYear();
  const month = input.month ?? referenceDate.getMonth();
  const { startDate, endDate } =
    input.year === undefined && input.month === undefined
      ? calendarEventWindowForToday(referenceDate)
      : calendarEventWindowForMonth(year, month);

  const events = await listEventsForOrg(supabase, input.organizationId, {
    startDate,
    endDate,
  });

  return { events, windowStartDate: startDate, windowEndDate: endDate };
}
