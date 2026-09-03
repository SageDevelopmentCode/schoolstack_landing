import { loadTuitionDashboardData } from "@/lib/tuition/load-tuition-dashboard-data";
import TuitionDashboardData from "./TuitionDashboardData";

type TuitionDashboardLoaderProps = {
  organizationId: string;
};

export default async function TuitionDashboardLoader({
  organizationId,
}: TuitionDashboardLoaderProps) {
  const dashboardData = await loadTuitionDashboardData(organizationId);

  return <TuitionDashboardData dashboardData={dashboardData} />;
}
