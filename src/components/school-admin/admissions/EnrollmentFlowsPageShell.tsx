"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { AdminGardenPageSkeleton } from "@/components/school-admin/garden/kit";
import type { EnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";
import ApplicationFormsPage from "./ApplicationFormsPage";
import EnrollmentFlowsStoryShell from "./EnrollmentFlowsStoryShell";
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
  const [listHydrated, setListHydrated] = useState(false);

  const hydrateList = useCallback((data: EnrollmentFlowsListData) => {
    setListData(data);
    setListHydrated(true);
  }, []);

  const contextValue = useMemo(
    () => ({
      hydrateList,
    }),
    [hydrateList],
  );

  return (
    <EnrollmentFlowsPageContext.Provider value={contextValue}>
      {listHydrated && listData ? (
        <ApplicationFormsPage
          organizationId={organizationId}
          branding={branding}
          schoolName={schoolName}
          slug={slug}
          initialListData={listData}
          listDeferred={false}
        />
      ) : (
        <EnrollmentFlowsStoryShell branding={branding}>
          <div className="p-5 sm:p-8">
            <AdminGardenPageSkeleton label="Loading enrollment flows" layout="split" />
          </div>
        </EnrollmentFlowsStoryShell>
      )}
      {children}
    </EnrollmentFlowsPageContext.Provider>
  );
}
