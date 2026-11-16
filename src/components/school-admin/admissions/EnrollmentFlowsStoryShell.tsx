"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

/*
 * Full-height Garden shell for Admissions → Enrollment Flows (overview, apply
 * form builder, enrollment checklist builder). It is the page's
 * ParentGardenFrame plus the admin Garden skin, so the builders' shared
 * primitives (AdminCard, AdminButton, BuilderQuestionCard, ConfirmDialog, …)
 * render in Garden. Name kept for import stability.
 */

type EnrollmentFlowsThemeContextValue = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

const EnrollmentFlowsThemeContext =
  createContext<EnrollmentFlowsThemeContextValue | null>(null);

export function useEnrollmentFlowsTheme(): EnrollmentFlowsThemeContextValue {
  const value = useContext(EnrollmentFlowsThemeContext);
  if (!value) {
    throw new Error("useEnrollmentFlowsTheme must be used within EnrollmentFlowsStoryShell");
  }
  return value;
}

type EnrollmentFlowsStoryShellProps = {
  branding: OrganizationBranding;
  children: ReactNode;
  className?: string;
};

export default function EnrollmentFlowsStoryShell({
  branding,
  children,
  className = "",
}: EnrollmentFlowsStoryShellProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);

  return (
    <EnrollmentFlowsThemeContext.Provider value={{ theme, C }}>
      <ParentGardenFrame
        theme={theme}
        className={`flex !h-full !min-h-0 flex-col overflow-hidden bg-[var(--sf-cream)] ${className}`}
      >
        <AdminGardenSkin theme={theme}>
          <div
            className="sf-admin-garden-skin flex h-full min-h-0 flex-col overflow-hidden"
            data-admin-workspace-garden
          >
            {children}
          </div>
        </AdminGardenSkin>
      </ParentGardenFrame>
    </EnrollmentFlowsThemeContext.Provider>
  );
}
