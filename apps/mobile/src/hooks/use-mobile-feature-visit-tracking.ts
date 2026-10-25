import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/auth-context';
import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import {
  resolveMobileFeatureKeyFromPathname,
  resolveParentProgramSlugFromPathname,
  type MobileFeatureVisitSurface,
} from '@/lib/mobile-feature-from-pathname';
import { reportMobileFeatureVisit } from '@/lib/mobile-feature-visit';
import { portalTypeToMobileSurface } from '@/lib/mobile-activity';
import { isPreviewSessionActive } from '@/lib/platform-admin/preview-session-store';

const DEBOUNCE_MS = 300;

type UseMobileFeatureVisitTrackingOptions = {
  surface: MobileFeatureVisitSurface;
  organizationId: string;
  enabled?: boolean;
  parentTabs?: Pick<MobileParentTabDefinition, 'tabId' | 'pathSegment'>[];
};

export function useMobileFeatureVisitTracking({
  surface,
  organizationId,
  enabled = true,
  parentTabs,
}: UseMobileFeatureVisitTrackingOptions): void {
  const pathname = usePathname();
  const { previewSession, isPlatformAdminSession, portalType } = useAuth();

  const parentTabsRef = useRef(parentTabs);
  parentTabsRef.current = parentTabs;

  useEffect(() => {
    if (!enabled || !organizationId.trim()) {
      return;
    }

    if (previewSession || isPreviewSessionActive() || isPlatformAdminSession) {
      return;
    }

    if (portalType === 'platform_admin') {
      return;
    }

    const mobileSurface = portalTypeToMobileSurface(portalType);
    if (mobileSurface !== surface) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const featureKey = resolveMobileFeatureKeyFromPathname(
        surface,
        pathname,
        parentTabsRef.current,
      );
      if (!featureKey) {
        return;
      }

      const programSlug =
        surface === 'parent_portal'
          ? resolveParentProgramSlugFromPathname(pathname)
          : undefined;

      reportMobileFeatureVisit({
        organizationId,
        surface,
        featureKey,
        pathname,
        programSlug,
      });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    enabled,
    organizationId,
    isPlatformAdminSession,
    pathname,
    portalType,
    previewSession,
    surface,
  ]);
}
