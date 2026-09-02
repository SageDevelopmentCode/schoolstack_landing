"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { EnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";
import ApplicationFormsPage from "./ApplicationFormsPage";
import { EnrollmentFlowsPageContext } from "./enrollment-flows-page-context";

type EnrollmentFlowsPageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  children?: ReactNode;
};

export default function EnrollmentFlowsPageShell({
  organizationId,
  branding,
  schoolName,
  slug,
  children,
}: EnrollmentFlowsPageShellProps) {
  const [listData, setListData] = useState<EnrollmentFlowsListData | null>(null);

  const hydrateList = useCallback((data: EnrollmentFlowsListData) => {
    setListData(data);
  }, []);

  const contextValue = useMemo(
    () => ({
      hydrateList,
    }),
    [hydrateList],
  );

  return (
    <EnrollmentFlowsPageContext.Provider value={contextValue}>
      <ApplicationFormsPage
        organizationId={organizationId}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        initialListData={listData ?? undefined}
        listDeferred={listData === null}
      />
      {children}
    </EnrollmentFlowsPageContext.Provider>
  );
}
