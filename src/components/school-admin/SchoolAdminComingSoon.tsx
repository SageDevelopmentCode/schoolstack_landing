"use client";

import { useMemo } from "react";
import { School } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolAdminComingSoonProps = {
  branding: OrganizationBranding;
  pageName: string;
};

export default function SchoolAdminComingSoon({
  branding,
  pageName,
}: SchoolAdminComingSoonProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center px-6">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: C.accentGlow }}
      >
        <School className="w-6 h-6" style={{ color: C.accent }} />
      </div>
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: C.textPrimary }}
      >
        {pageName}
      </h2>
      <p className="text-sm max-w-sm" style={{ color: C.textSecondary }}>
        This section is coming soon. Check back as we roll out more admin
        features for your school.
      </p>
    </div>
  );
}
