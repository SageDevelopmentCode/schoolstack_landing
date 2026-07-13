"use client";

import { useMemo } from "react";
import PaymentsHistoryPanel from "@/components/school-admin/admissions/PaymentsHistoryPanel";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type FinancesRevenuePageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
};

export default function FinancesRevenuePage({
  organizationId,
  slug,
  branding,
}: FinancesRevenuePageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <PaymentsHistoryPanel
        organizationId={organizationId}
        orgSlug={slug}
        branding={branding}
        mode="revenue"
      />
    </div>
  );
}
