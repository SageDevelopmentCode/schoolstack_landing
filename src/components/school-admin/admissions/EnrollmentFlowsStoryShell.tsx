"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { fraunces, dmSans } from "@/lib/fonts";
import {
  buildParentThemeTokens,
  parentThemeCssVars,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

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
      <div
        className={`flex h-full min-h-0 flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${className}`}
        data-admin-workspace-story
        style={{
          ...parentThemeCssVars(theme),
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: "#F7F9F7",
        }}
      >
        {children}
      </div>
    </EnrollmentFlowsThemeContext.Provider>
  );
}
