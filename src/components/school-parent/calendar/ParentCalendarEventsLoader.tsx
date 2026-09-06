import type { OrganizationEventAudienceScope } from "@/lib/school-events/events";
import { loadParentCalendarInitialData } from "@/lib/school-events/load-parent-calendar-data";
import ParentCalendarEventsData from "./ParentCalendarEventsData";

type ParentCalendarEventsLoaderProps = {
  organizationId: string;
  audienceScope?: OrganizationEventAudienceScope;
};

export default async function ParentCalendarEventsLoader({
  organizationId,
  audienceScope,
}: ParentCalendarEventsLoaderProps) {
  const initialData = await loadParentCalendarInitialData({
    organizationId,
    audienceScope,
  });

  return <ParentCalendarEventsData initialData={initialData} />;
}
