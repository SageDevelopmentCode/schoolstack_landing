"use client";

import { useMemo } from "react";
import PaymentsHistoryPanel from "@/components/school-admin/admissions/PaymentsHistoryPanel";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type FinancesTransactionsPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
};

export default function FinancesTransactionsPage({
  organizationId,
  slug,
  branding,
}: FinancesTransactionsPageProps) {
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
        mode="transactions"
      />
    </div>
  );
}
