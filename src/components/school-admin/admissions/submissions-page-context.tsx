"use client";

import { createContext, useContext } from "react";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";

type SubmissionsPageContextValue = {
  hydrateTable: (data: ApplicationSubmissionsTableData) => void;
};

export const SubmissionsPageContext = createContext<SubmissionsPageContextValue | null>(
  null,
);

export function useSubmissionsPageContext() {
  const context = useContext(SubmissionsPageContext);
  if (!context) {
    throw new Error("useSubmissionsPageContext must be used within ApplicationSubmissionsPageShell");
  }
  return context;
}
