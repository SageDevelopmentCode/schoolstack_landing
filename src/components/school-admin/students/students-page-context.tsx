"use client";

import { createContext, useContext } from "react";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";

type StudentsPageContextValue = {
  hydrateTable: (data: StudentsTableData) => void;
};

export const StudentsPageContext = createContext<StudentsPageContextValue | null>(
  null,
);

export function useStudentsPageContext() {
  const context = useContext(StudentsPageContext);
  if (!context) {
    throw new Error("useStudentsPageContext must be used within StudentsPageShell");
  }
  return context;
}
