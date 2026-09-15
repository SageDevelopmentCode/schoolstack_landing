import { createContext, useContext, useMemo, type ReactNode } from 'react';

import {
  buildParentThemeTokens,
  type MobileParentTheme,
} from '@/lib/organization-settings/parent-theme';
import type { OrganizationBranding } from '@/lib/organization-settings/types';

const ParentThemeContext = createContext<MobileParentTheme | null>(null);

export function ParentThemeProvider({
  branding,
  children,
}: {
  branding: OrganizationBranding;
  children: ReactNode;
}) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  return <ParentThemeContext.Provider value={theme}>{children}</ParentThemeContext.Provider>;
}

export function useParentTheme(): MobileParentTheme {
  const theme = useContext(ParentThemeContext);
  if (!theme) {
    throw new Error('useParentTheme must be used within ParentThemeProvider');
  }
  return theme;
}

export function useOptionalParentTheme(): MobileParentTheme | null {
  return useContext(ParentThemeContext);
}
