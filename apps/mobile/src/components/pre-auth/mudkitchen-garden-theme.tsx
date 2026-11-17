import type { ReactNode } from 'react';

import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Brand } from '@/constants/theme';
import { DEFAULT_BRANDING, DEFAULT_BRANDING_COLORS } from '@/lib/organization-settings/merge-branding';
import type { OrganizationBranding } from '@/lib/organization-settings/types';

/** Web `--sf-clay-deep`: small clay text and the toy-button shadow tone. */
const CLAY_DEEP = '#7E4533';

/**
 * MudKitchen's own colours for the Garden kit. Pre-auth screens are
 * MudKitchen-owned (Calm Garden), so `useGardenAccent()` resolves to clay
 * instead of a school's accent.
 */
const MUDKITCHEN_GARDEN_BRANDING: OrganizationBranding = {
  ...DEFAULT_BRANDING,
  colors: {
    ...DEFAULT_BRANDING_COLORS,
    accent: Brand.clay,
    accentBright: Brand.clay,
    accentMid: Brand.clay,
    accentDark: CLAY_DEEP,
    accentLight: 'rgba(160, 92, 69, 0.10)',
    accentGlow: 'rgba(160, 92, 69, 0.12)',
    secondaryBtnBorder: 'rgba(160, 92, 69, 0.22)',
  },
};

export function MudKitchenGardenThemeProvider({ children }: { children: ReactNode }) {
  return <ParentThemeProvider branding={MUDKITCHEN_GARDEN_BRANDING}>{children}</ParentThemeProvider>;
}
