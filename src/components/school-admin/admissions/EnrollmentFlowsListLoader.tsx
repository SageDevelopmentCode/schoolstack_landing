import { loadEnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";
import EnrollmentFlowsListData from "./EnrollmentFlowsListData";

type EnrollmentFlowsListLoaderProps = {
  organizationId: string;
};

export default async function EnrollmentFlowsListLoader({
  organizationId,
}: EnrollmentFlowsListLoaderProps) {
  const listData = await loadEnrollmentFlowsListData(organizationId);

  return <EnrollmentFlowsListData listData={listData} />;
}
