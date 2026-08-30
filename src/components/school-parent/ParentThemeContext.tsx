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
}: {
  branding: OrganizationBranding;
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const theme = buildParentThemeTokens(branding);
    return {
      theme,
      adminCompat: parentThemeToAdminCompat(theme),
    };
  }, [branding]);

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
