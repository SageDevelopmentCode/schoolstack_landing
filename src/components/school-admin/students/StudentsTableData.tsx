"use client";

import { useLayoutEffect } from "react";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";
import { useStudentsPageContext } from "./students-page-context";

type StudentsTableDataProps = {
  tableData: StudentsTableData;
};

export default function StudentsTableData({
  tableData,
}: StudentsTableDataProps) {
  const { hydrateTable } = useStudentsPageContext();

  useLayoutEffect(() => {
    hydrateTable(tableData);
  }, [hydrateTable, tableData]);

  return null;
}
