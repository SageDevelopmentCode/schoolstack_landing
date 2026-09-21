"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentThemeContextValue = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
};

const ParentThemeContext = createContext<ParentThemeContextValue | null>(null);

export function ParentThemeProvider({
  branding,
  children,
  themeOverride,
}: {
  branding: OrganizationBranding;
  children: ReactNode;
  themeOverride?: ParentThemeTokens;
}) {
  const value = useMemo(() => {
    const theme = themeOverride ?? buildParentThemeTokens(branding);
    return {
      theme,
      adminCompat: parentThemeToAdminCompat(theme),
    };
  }, [branding, themeOverride]);

  return (
    <ParentThemeContext.Provider value={value}>
      {children}
    </ParentThemeContext.Provider>
  );
}

export function useParentTheme(): ParentThemeContextValue {
  const ctx = useContext(ParentThemeContext);
  if (!ctx) {
    throw new Error("useParentTheme must be used within ParentThemeProvider");
  }
  return ctx;
}
