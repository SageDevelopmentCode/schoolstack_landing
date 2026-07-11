"use client";

import { useMemo } from "react";
import { Home } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolParentComingSoonProps = {
  branding: OrganizationBranding;
};

export default function SchoolParentComingSoon({
  branding,
}: SchoolParentComingSoonProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: C.accentGlow }}
      >
        <Home className="h-6 w-6" style={{ color: C.accent }} />
      </div>
      <p className="max-w-sm text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        This section is coming soon. Check back as we roll out more parent portal
        features for your school.
      </p>
    </div>
  );
}
