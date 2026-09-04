import {
  calendarEventWindowForMonth,
  calendarEventWindowForToday,
} from "./calendar-window";
import { listEventsForOrg, type OrganizationEventAudienceScope } from "./events";
import type { ParentCalendarInitialData } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";

export async function loadParentCalendarPreviewData(input: {
  organizationId: string;
  year?: number;
  month?: number;
  audienceScope?: OrganizationEventAudienceScope;
}): Promise<ParentCalendarInitialData> {
  const admin = createAdminClient();
  const referenceDate = new Date();
  const year = input.year ?? referenceDate.getFullYear();
  const month = input.month ?? referenceDate.getMonth();
  const { startDate, endDate } =
    input.year === undefined && input.month === undefined
      ? calendarEventWindowForToday(referenceDate)
      : calendarEventWindowForMonth(year, month);

  const audienceScope =
    input.audienceScope ??
    ({ mode: "main_portal" } satisfies OrganizationEventAudienceScope);

  const events = await listEventsForOrg(admin, input.organizationId, {
    startDate,
    endDate,
    audienceScope,
  });

  return { events, windowStartDate: startDate, windowEndDate: endDate };
}
