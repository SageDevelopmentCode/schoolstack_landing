"use client";

import { useMemo, type ReactNode } from "react";
import AdminToaster from "@/components/school-admin/AdminToaster";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolAdminChecklistPreviewShellProps = {
  branding: OrganizationBranding;
  children: ReactNode;
};

export default function SchoolAdminChecklistPreviewShell({
  branding,
  children,
}: SchoolAdminChecklistPreviewShellProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  return (
    <div
      className="h-dvh w-full overflow-hidden"
      style={{ backgroundColor: C.bg, fontFamily: bodyFont }}
    >
      <AdminToaster C={C} />
      {children}
    </div>
  );
}
