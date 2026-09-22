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

export const SCHOOL_ADMIN_PAPER_BG = "#F7F9F7";

export type SchoolAdminStoryThemeContextValue = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

const SchoolAdminStoryThemeContext =
  createContext<SchoolAdminStoryThemeContextValue | null>(null);

type SchoolAdminStoryThemeProviderProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  children: ReactNode;
  className?: string;
};

export function SchoolAdminStoryThemeProvider({
  theme,
  C,
  children,
  className = "",
}: SchoolAdminStoryThemeProviderProps) {
  return (
    <SchoolAdminStoryThemeContext.Provider value={{ theme, C }}>
      <div
        className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${className}`}
        style={{
          ...parentThemeCssVars(theme),
          fontFamily: theme.fontBody,
          color: theme.ink,
        }}
      >
        {children}
      </div>
    </SchoolAdminStoryThemeContext.Provider>
  );
}

export function useSchoolAdminStoryTheme(): SchoolAdminStoryThemeContextValue {
  const value = useContext(SchoolAdminStoryThemeContext);
  if (!value) {
    throw new Error("useSchoolAdminStoryTheme must be used within SchoolAdminStoryShell");
  }
  return value;
}

type SchoolAdminStoryShellProps = {
  branding: OrganizationBranding;
  children: ReactNode;
  className?: string;
};

export default function SchoolAdminStoryShell({
  branding,
  children,
  className = "",
}: SchoolAdminStoryShellProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);

  return (
    <SchoolAdminStoryThemeProvider
      theme={theme}
      C={C}
      className={`flex h-full min-h-0 flex-col overflow-hidden ${className}`}
    >
      <div data-admin-workspace-story className="flex h-full min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    </SchoolAdminStoryThemeProvider>
  );
}
