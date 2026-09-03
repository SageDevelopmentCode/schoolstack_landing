import { loadParentCalendarPreviewData } from "@/lib/school-events/load-parent-calendar-preview-data";
import ParentCalendarEventsData from "./ParentCalendarEventsData";

type ParentCalendarPreviewEventsLoaderProps = {
  organizationId: string;
};

export default async function ParentCalendarPreviewEventsLoader({
  organizationId,
}: ParentCalendarPreviewEventsLoaderProps) {
  const initialData = await loadParentCalendarPreviewData({ organizationId });

  return <ParentCalendarEventsData initialData={initialData} />;
}
