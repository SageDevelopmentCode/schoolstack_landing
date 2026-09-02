"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { TuitionSetupStatus } from "@/lib/tuition/setup-status";
import type { TuitionDashboardData } from "@/lib/tuition/load-tuition-dashboard-data";
import TuitionDashboard from "@/components/school-admin/tuition/TuitionDashboard";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import { TuitionPageContext } from "./tuition-page-context";

type TuitionPageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  setupStatus: TuitionSetupStatus;
  children?: ReactNode;
};

export default function TuitionPageShell({
  organizationId,
  branding,
  slug,
  setupStatus,
  children,
}: TuitionPageShellProps) {
  const [dashboardData, setDashboardData] = useState<TuitionDashboardData | null>(null);
  const [dashboardHydrated, setDashboardHydrated] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const hydrateDashboard = useCallback((data: TuitionDashboardData) => {
    setDashboardData(data);
    setDashboardHydrated(true);
  }, []);

  const contextValue = useMemo(
    () => ({
      hydrateDashboard,
    }),
    [hydrateDashboard],
  );

  if (!setupStatus.hasActiveRatePlan) {
    return (
      <TuitionSetupWizard
        organizationId={organizationId}
        branding={branding}
        draftRatePlanId={setupStatus.draftRatePlanId}
        onComplete={() => window.location.reload()}
      />
    );
  }

  if (showSetupWizard) {
    return (
      <TuitionSetupWizard
        organizationId={organizationId}
        branding={branding}
        draftRatePlanId={setupStatus.draftRatePlanId}
        onComplete={() => {
          setShowSetupWizard(false);
          window.location.reload();
        }}
        onCancelEdit={() => setShowSetupWizard(false)}
      />
    );
  }

  return (
    <TuitionPageContext.Provider value={contextValue}>
      <TuitionDashboard
        organizationId={organizationId}
        branding={branding}
        slug={slug}
        setupStatus={setupStatus}
        initialDashboardData={dashboardData}
        dashboardDeferred={!dashboardHydrated}
        onOpenSetupWizard={() => setShowSetupWizard(true)}
      />
      {children}
    </TuitionPageContext.Provider>
  );
}
