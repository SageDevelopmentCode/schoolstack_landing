"use client";

import FinancesTransactionsPageShell from "@/components/school-admin/finances/FinancesTransactionsPageShell";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type FinancesTransactionsPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
};

export default function FinancesTransactionsPage({
  organizationId,
  slug,
}: FinancesTransactionsPageProps) {
  return (
    <FinancesTransactionsPageShell organizationId={organizationId} slug={slug} />
  );
}
