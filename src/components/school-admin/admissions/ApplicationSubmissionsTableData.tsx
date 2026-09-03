"use client";

import { useLayoutEffect } from "react";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import { useSubmissionsPageContext } from "./submissions-page-context";

type ApplicationSubmissionsTableDataProps = {
  tableData: ApplicationSubmissionsTableData;
};

export default function ApplicationSubmissionsTableData({
  tableData,
}: ApplicationSubmissionsTableDataProps) {
  const { hydrateTable } = useSubmissionsPageContext();

  useLayoutEffect(() => {
    hydrateTable(tableData);
  }, [hydrateTable, tableData]);

  return null;
}
