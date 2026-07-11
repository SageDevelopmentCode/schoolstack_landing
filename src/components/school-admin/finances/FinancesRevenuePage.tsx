"use client";

import PaymentsHistoryPanel from "@/components/school-admin/admissions/PaymentsHistoryPanel";
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
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <PaymentsHistoryPanel
        organizationId={organizationId}
        orgSlug={slug}
        branding={branding}
        variant="page"
        mode="revenue"
      />
    </div>
  );
}
