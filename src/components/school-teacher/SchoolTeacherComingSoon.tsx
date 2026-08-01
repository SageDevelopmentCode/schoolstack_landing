"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolTeacherComingSoonProps = {
  branding: OrganizationBranding;
  featureLabel: string;
};

export default function SchoolTeacherComingSoon({
  branding,
  featureLabel,
}: SchoolTeacherComingSoonProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <div
      className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: C.accentGlow }}
      >
        <Sparkles className="h-5 w-5" style={{ color: C.accent }} />
      </div>
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        {featureLabel}
      </h2>
      <p className="mt-2 max-w-sm text-sm" style={{ color: C.textSecondary }}>
        This section is coming soon. Check back as we roll out more tools for
        your classroom.
      </p>
    </div>
  );
}
