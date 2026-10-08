import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { PortalPreviewBanner } from '@/components/platform-admin/portal-preview-banner';
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
  parentMoreRoute,
  parentProgramAccountRoute,
  parentProgramMoreRoute,
  parentProgramTabRoute,
  type ParentMoreMenuItemId,
  type ParentTab,
} from '@/lib/parent/parent-nav';
import { useCompletePortalTransitionOnMount } from '@/contexts/portal-transition-context';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { usePortalPreview, useExitPortalPreviewNavigation } from '@/lib/portal-preview-gating';

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

  useCompletePortalTransitionOnMount();

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
  const insets = useSafeAreaInsets();

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
    const target =
      activeProgramSlug != null
        ? parentProgramMoreRoute(slug, activeProgramSlug, itemId)
        : parentMoreRoute(slug, itemId);
    if (!pathname.includes(`/more/${itemId}`)) {
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
    <>
      {isPreview ? <PortalPreviewBanner onExit={() => void exitPreview()} /> : null}
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: bottomChromeHeight } : null,
        ]}>
        <AnimatedTabContent transitionKey={showTabBar ? pathTab : null}>
          <Slot />
        </AnimatedTabContent>
      </View>
      {showTabBar && activeTab ? (
        <View
          pointerEvents="box-none"
          style={[styles.bottomChrome, { bottom: insets.bottom + 4 }]}>
          {coopBanner}
          <ParentFloatingTabBar
            embedded
            tabs={tabBarTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            messagesUnreadCount={unreadCount}
          />
        </View>
      ) : null}
      <ParentMoreMenuSheet
        visible={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        onSelect={handleSelectMoreItem}
        onSelectAccount={handleSelectAccount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'stretch',
  },
});
