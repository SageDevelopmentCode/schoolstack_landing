"use client";

import { createContext, useContext } from "react";
import type { EnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";

type EnrollmentFlowsPageContextValue = {
  hydrateList: (data: EnrollmentFlowsListData) => void;
};

export const EnrollmentFlowsPageContext =
  createContext<EnrollmentFlowsPageContextValue | null>(null);

export function useEnrollmentFlowsPageContext() {
  const context = useContext(EnrollmentFlowsPageContext);
  if (!context) {
    throw new Error(
      "useEnrollmentFlowsPageContext must be used within EnrollmentFlowsPageShell",
    );
  }
  return context;
}
