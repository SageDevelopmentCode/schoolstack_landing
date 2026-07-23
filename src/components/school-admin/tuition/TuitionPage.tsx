"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import TuitionDashboard from "@/components/school-admin/tuition/TuitionDashboard";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import { fetchTuitionSetupStatus } from "@/lib/tuition/setup-status";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

export default function TuitionPage({
  organizationId,
  branding,
  slug,
}: TuitionPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [setupStatus, setSetupStatus] = useState<Awaited<
    ReturnType<typeof fetchTuitionSetupStatus>
  > | null>(null);

  const loadSetupStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await fetchTuitionSetupStatus(supabase, organizationId);
      setSetupStatus(status);
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSetupStatus();
    });
  }, [loadSetupStatus]);

  if (loading || !setupStatus) {
    return <SchoolAdminSplitPaneSkeleton C={C} label="Loading tuition" />;
  }

  if (!setupStatus.hasActiveRatePlan) {
    return (
      <TuitionSetupWizard
        organizationId={organizationId}
        branding={branding}
        draftRatePlanId={setupStatus.draftRatePlanId}
        onComplete={() => void loadSetupStatus()}
      />
    );
  }

  return (
    <TuitionDashboard
      organizationId={organizationId}
      branding={branding}
      slug={slug}
      setupStatus={setupStatus}
      onRefreshSetupStatus={loadSetupStatus}
    />
  );
}
