import { loadStudentsTableData } from "@/lib/school-admin/load-students-table-data";
import StudentsTableData from "./StudentsTableData";

type StudentsTableLoaderProps = {
  organizationId: string;
};

export default async function StudentsTableLoader({
  organizationId,
}: StudentsTableLoaderProps) {
  const tableData = await loadStudentsTableData(organizationId);

  return <StudentsTableData tableData={tableData} />;
}
