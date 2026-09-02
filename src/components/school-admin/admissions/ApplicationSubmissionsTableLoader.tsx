import { cookies } from "next/headers";
import { loadApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import ApplicationSubmissionsTableData from "./ApplicationSubmissionsTableData";

type ApplicationSubmissionsTableLoaderProps = {
  organizationId: string;
};

export default async function ApplicationSubmissionsTableLoader({
  organizationId,
}: ApplicationSubmissionsTableLoaderProps) {
  await cookies();
  const tableData = await loadApplicationSubmissionsTableData(organizationId);

  return <ApplicationSubmissionsTableData tableData={tableData} />;
}
