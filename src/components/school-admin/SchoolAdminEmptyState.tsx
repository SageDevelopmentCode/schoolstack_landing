"use client";

import { useMemo } from "react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolAdminEmptyStateProps = {
  branding: OrganizationBranding;
};

export default function SchoolAdminEmptyState({
  branding,
}: SchoolAdminEmptyStateProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center px-6">
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: C.textPrimary }}
      >
        No admin features enabled
      </h2>
      <p className="text-sm max-w-sm" style={{ color: C.textSecondary }}>
        Enable admin portal features in organization settings to see navigation
        here.
      </p>
    </div>
  );
}
