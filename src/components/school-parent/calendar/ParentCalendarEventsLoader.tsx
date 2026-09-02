import { loadParentCalendarInitialData } from "@/lib/school-events/load-parent-calendar-data";
import ParentCalendarEventsData from "./ParentCalendarEventsData";

type ParentCalendarEventsLoaderProps = {
  organizationId: string;
};

export default async function ParentCalendarEventsLoader({
  organizationId,
}: ParentCalendarEventsLoaderProps) {
  const initialData = await loadParentCalendarInitialData({ organizationId });

  return <ParentCalendarEventsData initialData={initialData} />;
}
