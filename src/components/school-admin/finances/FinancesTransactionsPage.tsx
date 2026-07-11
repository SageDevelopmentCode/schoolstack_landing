"use client";

import PaymentsHistoryPanel from "@/components/school-admin/admissions/PaymentsHistoryPanel";
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
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <PaymentsHistoryPanel
        organizationId={organizationId}
        orgSlug={slug}
        branding={branding}
        variant="page"
        mode="transactions"
      />
    </div>
  );
}
