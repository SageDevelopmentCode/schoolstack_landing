import { createContext, useContext, useMemo, type ReactNode } from 'react';

import {
  buildMobileAdminTheme,
  buildPlatformAdminTheme,
  type MobileAdminTheme,
} from '@/lib/organization-settings/build-admin-theme';
import type { OrganizationBranding } from '@/lib/organization-settings/types';

const AdminThemeContext = createContext<MobileAdminTheme | null>(null);

export function AdminShellThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => buildPlatformAdminTheme(), []);
  return <AdminThemeContext.Provider value={theme}>{children}</AdminThemeContext.Provider>;
}

export function SchoolAdminThemeProvider({
  branding,
  children,
}: {
  branding: OrganizationBranding;
  children: ReactNode;
}) {
  const theme = useMemo(() => buildMobileAdminTheme(branding), [branding]);
  return <AdminThemeContext.Provider value={theme}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme(): MobileAdminTheme {
  const theme = useContext(AdminThemeContext);
  if (!theme) {
    throw new Error('useAdminTheme must be used within an admin theme provider');
  }
  return theme;
}
