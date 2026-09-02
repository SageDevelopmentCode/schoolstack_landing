"use client";

import { useLayoutEffect } from "react";
import type { EnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";
import { useEnrollmentFlowsPageContext } from "./enrollment-flows-page-context";

type EnrollmentFlowsListDataProps = {
  listData: EnrollmentFlowsListData;
};

export default function EnrollmentFlowsListData({
  listData,
}: EnrollmentFlowsListDataProps) {
  const { hydrateList } = useEnrollmentFlowsPageContext();

  useLayoutEffect(() => {
    hydrateList(listData);
  }, [hydrateList, listData]);

  return null;
}
