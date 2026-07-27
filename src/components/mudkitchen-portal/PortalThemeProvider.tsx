"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  buildPortalTheme,
  type PortalTheme,
} from "@/lib/mudkitchen-portal/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

const PortalThemeContext = createContext<PortalTheme | null>(null);

type PortalThemeProviderProps = {
  branding: OrganizationBranding;
  children: ReactNode;
};

export function PortalThemeProvider({
  branding,
  children,
}: PortalThemeProviderProps) {
  const theme = useMemo(() => buildPortalTheme(branding), [branding]);

  return (
    <PortalThemeContext.Provider value={theme}>
      {children}
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme(): PortalTheme {
  const theme = useContext(PortalThemeContext);
  if (!theme) {
    throw new Error("usePortalTheme must be used within PortalThemeProvider");
  }
  return theme;
}
