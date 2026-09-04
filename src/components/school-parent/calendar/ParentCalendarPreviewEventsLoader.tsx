import type { OrganizationEventAudienceScope } from "@/lib/school-events/events";
import { loadParentCalendarPreviewData } from "@/lib/school-events/load-parent-calendar-preview-data";
import ParentCalendarEventsData from "./ParentCalendarEventsData";

type ParentCalendarPreviewEventsLoaderProps = {
  organizationId: string;
  audienceScope?: OrganizationEventAudienceScope;
};

export default async function ParentCalendarPreviewEventsLoader({
  organizationId,
  audienceScope,
}: ParentCalendarPreviewEventsLoaderProps) {
  const initialData = await loadParentCalendarPreviewData({
    organizationId,
    audienceScope,
  });

  return <ParentCalendarEventsData initialData={initialData} />;
}
