import { loadScheduleVisitsData } from "@/lib/school-admin/load-schedule-visits-data";
import ScheduleVisitsData from "./ScheduleVisitsData";

type ScheduleVisitsLoaderProps = {
  organizationId: string;
};

export default async function ScheduleVisitsLoader({
  organizationId,
}: ScheduleVisitsLoaderProps) {
  const visitsData = await loadScheduleVisitsData(organizationId);

  return <ScheduleVisitsData visitsData={visitsData} />;
}
