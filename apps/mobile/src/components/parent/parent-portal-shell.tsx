import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Href } from 'expo-router';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { PortalPreviewBanner } from '@/components/platform-admin/portal-preview-banner';
import { GardenToastProvider } from '@/components/parent/garden/toast';
import { ParentMoreMenuSheet } from '@/components/parent/parent-more-menu-sheet';
import {
  ParentPortalCoopTabBarBanner,
  resolveParentBottomChromeHeight,
  shouldShowParentCoopTabBarBanner,
} from '@/components/parent/parent-portal-coop-tab-bar-banner';
import { ParentPortalCoopTabBarBannerSkeleton } from '@/components/parent/parent-portal-program-chrome-skeleton';
import { ParentFloatingTabBar } from '@/components/parent/parent-floating-tab-bar';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import {
  getParentActiveTabFromPathname,
  isParentProgramPortalPath,
  parentAccountRoute,
  parentProgramAccountRoute,
  parentProgramTabRoute,
  isParentMoreMenuItemActive,
  resolveParentMoreMenuNavigationTarget,
  type ParentMoreMenuItemId,
  type ParentTab,
} from '@/lib/parent/parent-nav';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { usePortalPreview, useExitPortalPreviewNavigation } from '@/lib/portal-preview-gating';
import { useMobileFeatureVisitTracking } from '@/hooks/use-mobile-feature-visit-tracking';

export function ParentPortalShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount, refreshUnreadCount } = useMessagesUnread();
  const { isPreview } = usePortalPreview();
  const exitPreview = useExitPortalPreviewNavigation();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const {
    slug,
    activeProgramSlug,
    tabBarTabs,
    redirectAwayFromMainPortal,
    defaultMobileEntryPath,
    isLoading: portalContextsLoading,
    showSwitcher,
    activeContext,
    activePortalFeatures,
    organizationId,
  } = useParentPortalContext();

  useMobileFeatureVisitTracking({
    surface: 'parent_portal',
    organizationId,
    enabled: Boolean(organizationId && slug),
    parentTabs: tabBarTabs,
  });

  useEffect(() => {
    if (organizationId && slug) {
      void prefetchSchoolPortalOptions(organizationId, slug);
    }
  }, [organizationId, slug]);

  const pathTab = getParentActiveTabFromPathname(pathname, tabBarTabs);
  const activeTab = moreSheetOpen ? 'more' : pathTab;
  const showTabBar = pathTab !== null;

  const showCoopTabBarBanner = useMemo(
    () =>
      shouldShowParentCoopTabBarBanner({
        showSwitcher,
        hasActiveContext: Boolean(activeContext),
        coopMode: Boolean(activePortalFeatures?.coopMode),
        programLabel: activePortalFeatures?.programLabel,
      }),
    [activeContext, activePortalFeatures?.coopMode, activePortalFeatures?.programLabel, showSwitcher],
  );

  const showCoopTabBarBannerSkeleton = Boolean(
    portalContextsLoading && activeProgramSlug && !showCoopTabBarBanner,
  );
  const reserveCoopBannerChrome = showCoopTabBarBanner || showCoopTabBarBannerSkeleton;
  const bottomChromeHeight = resolveParentBottomChromeHeight(reserveCoopBannerChrome);

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  useEffect(() => {
    if (portalContextsLoading || !slug) return;
    if (activeProgramSlug) return;
    if (!redirectAwayFromMainPortal) return;
    if (isParentProgramPortalPath(pathname)) return;
    if (pathname.includes('/bulletin/')) return;

    router.replace(defaultMobileEntryPath as Href);
  }, [
    activeProgramSlug,
    defaultMobileEntryPath,
    pathname,
    portalContextsLoading,
    redirectAwayFromMainPortal,
    router,
    slug,
  ]);

  const handleTabChange = (tab: ParentTab) => {
    if (!slug) return;
    if (tab === 'more') {
      setMoreSheetOpen((open) => !open);
      return;
    }

    setMoreSheetOpen(false);
    const selected = tabBarTabs.find((entry) => entry.tabId === tab);
    if (!selected) return;

    if (activeProgramSlug) {
      router.replace(parentProgramTabRoute(slug, activeProgramSlug, selected.pathSegment));
      return;
    }

    router.replace(`/parent/${slug}/${selected.pathSegment}` as Href);
  };

  const handleSelectMoreItem = (itemId: ParentMoreMenuItemId) => {
    setMoreSheetOpen(false);
    if (!slug) return;
    const target = resolveParentMoreMenuNavigationTarget(slug, itemId, activeProgramSlug);
    if (!isParentMoreMenuItemActive(pathname, itemId)) {
      const isMainTab = pathTab !== null && pathTab !== 'more';
      if (isMainTab) {
        router.replace(target);
      } else {
        router.push(target);
      }
    }
  };

  const handleSelectAccount = () => {
    setMoreSheetOpen(false);
    if (!slug) return;
    const target =
      activeProgramSlug != null
        ? parentProgramAccountRoute(slug, activeProgramSlug)
        : parentAccountRoute(slug);
    if (!pathname.includes('/more/account')) {
      const isMainTab = pathTab !== null && pathTab !== 'more';
      if (isMainTab) {
        router.replace(target);
      } else {
        router.push(target);
      }
    }
  };

  const coopBanner =
    showCoopTabBarBanner && activePortalFeatures?.programLabel ? (
      <ParentPortalCoopTabBarBanner programLabel={activePortalFeatures.programLabel} />
    ) : showCoopTabBarBannerSkeleton ? (
      <ParentPortalCoopTabBarBannerSkeleton />
    ) : null;

  return (
    // Gestures + Garden toasts wrap the whole shell, so the tab bar and the More sheet can toast too.
    <GestureHandlerRootView style={styles.content}>
      <GardenToastProvider bottomOffset={showTabBar ? bottomChromeHeight + 10 : 12}>
        {isPreview ? <PortalPreviewBanner onExit={() => void exitPreview()} /> : null}
        <View
          testID={showTabBar && !portalContextsLoading ? 'parent-portal-ready' : undefined}
          style={[
            styles.content,
            showTabBar ? { paddingBottom: bottomChromeHeight } : null,
          ]}>
          <AnimatedTabContent transitionKey={showTabBar ? pathTab : null}>
            <Slot />
          </AnimatedTabContent>
        </View>
        {showTabBar && activeTab ? (
          <ParentFloatingTabBar
            header={coopBanner}
            tabs={tabBarTabs}
            activeTab={activeTab}
            moreSheetOpen={moreSheetOpen}
            onChange={handleTabChange}
            messagesUnreadCount={unreadCount}
          />
        ) : null}
        <ParentMoreMenuSheet
          visible={moreSheetOpen}
          onClose={() => setMoreSheetOpen(false)}
          onSelect={handleSelectMoreItem}
          onSelectAccount={handleSelectAccount}
        />
      </GardenToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
