"use client";

import { useMemo } from "react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolParentEmptyStateProps = {
  branding: OrganizationBranding;
};

export default function SchoolParentEmptyState({
  branding,
}: SchoolParentEmptyStateProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="mb-2 text-lg font-semibold" style={{ color: C.textPrimary }}>
        No parent portal features enabled
      </h2>
      <p className="max-w-sm text-sm" style={{ color: C.textSecondary }}>
        Enable parent portal features in organization settings to see navigation here.
      </p>
    </div>
  );
}
