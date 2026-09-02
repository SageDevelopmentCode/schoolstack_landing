"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import type { ScheduleVisitsData } from "@/lib/school-admin/load-schedule-visits-data";
import type { SchedulePageMeta } from "@/lib/school-admin/schedule-page-meta";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import SchedulePage from "@/components/school-admin/SchedulePage";
import { ScheduleVisitsContext } from "./schedule-visits-context";

type SchedulePageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  initialMeta: SchedulePageMeta;
  children?: ReactNode;
};

export default function SchedulePageShell({
  organizationId,
  branding,
  schoolName,
  slug,
  initialMeta,
  children,
}: SchedulePageShellProps) {
  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [visitsReady, setVisitsReady] = useState(false);

  const hydrateVisits = useCallback((data: ScheduleVisitsData) => {
    setVisits(data.visits);
    setVisitsReady(true);
  }, []);

  const refetchVisits = useCallback(async () => {
    const response = await fetch(
      `/api/school-admin/schedule/visits?organizationId=${encodeURIComponent(organizationId)}`,
    );
    if (!response.ok) return;
    const body = (await response.json()) as ScheduleVisitsData;
    hydrateVisits(body);
  }, [hydrateVisits, organizationId]);

  const contextValue = useMemo(
    () => ({
      visits,
      visitsReady,
      hydrateVisits,
      refetchVisits,
    }),
    [hydrateVisits, refetchVisits, visits, visitsReady],
  );

  return (
    <ScheduleVisitsContext.Provider value={contextValue}>
      <SchedulePage
        organizationId={organizationId}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        initialMeta={initialMeta}
        visitsDeferred={!visitsReady}
      />
      {children}
    </ScheduleVisitsContext.Provider>
  );
}
