import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { PortalPreviewBanner } from '@/components/platform-admin/portal-preview-banner';
import { ParentMoreMenuSheet } from '@/components/parent/parent-more-menu-sheet';
import {
  PARENT_FLOATING_TAB_BAR_HEIGHT,
  ParentFloatingTabBar,
} from '@/components/parent/parent-floating-tab-bar';
import { MessagesRealtimeProvider, useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { MessagesUnreadProvider, useMessagesUnread } from '@/contexts/messages-unread-context';
import { ParentBillingProvider } from '@/contexts/parent-billing-context';
import { ParentCalendarProvider } from '@/contexts/parent-calendar-context';
import { ParentClassroomSignupsProvider } from '@/contexts/parent-classroom-signups-context';
import { ParentFormsDocumentsProvider } from '@/contexts/parent-forms-documents-context';
import { ParentFridayBranchProvider } from '@/contexts/parent-friday-branch-context';
import { ParentCommitteesProvider } from '@/contexts/parent-committees-context';
import { ParentHomeProvider } from '@/contexts/parent-home-context';
import { ParentMessagesInboxProvider, useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import {
  isParentBulletinDetailPath,
  isParentChildDetailPath,
  parentAccountRoute,
  parentMoreRoute,
  parentTabRoute,
  type ParentMoreMenuItemId,
  type ParentTab,
} from '@/lib/parent/parent-nav';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';
import { fetchParentMessagesUnreadCount } from '@/lib/parent/parent-portal-api';
import { isPortalSessionAllowed } from '@/lib/platform-admin/portal-preview-layout';
import { useExitPortalPreviewNavigation, usePortalPreview } from '@/lib/portal-preview-gating';

function getActiveTab(pathname: string): ParentTab | null {
  if (isParentChildDetailPath(pathname)) return null;
  if (isParentBulletinDetailPath(pathname)) return null;
  if (pathname.includes('/more')) return 'more';
  if (/\/messages\/[^/]+$/.test(pathname)) return null;
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/billing')) return 'billing';
  if (pathname.includes('/home')) return 'home';
  return null;
}

function ParentMessagesInboxRealtimeBridge() {
  const { refresh } = useParentMessagesInbox();
  const { subscribeMessagesUpdated } = useMessagesRealtime();

  useEffect(() => {
    return subscribeMessagesUpdated(() => {
      void refresh({ silent: true });
    });
  }, [refresh, subscribeMessagesUpdated]);

  return null;
}

function ParentLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAdminTheme();
  const { unreadCount, refreshUnreadCount } = useMessagesUnread();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, selectedSchool, portalType, previewSession, isLoading } = useAuth();
  const { isPreview } = usePortalPreview();
  const exitPreview = useExitPortalPreviewNavigation();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const pathTab = getActiveTab(pathname);
  const activeTab = moreSheetOpen ? 'more' : pathTab;
  const showTabBar = pathTab !== null;

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  useRecoverableAuthRedirect(Boolean(slug) && !user, isLoading || !slug);

  useEffect(() => {
    if (isLoading || !slug || !user) return;

    if (
      !isPortalSessionAllowed(
        portalType,
        selectedSchool?.slug,
        'parent',
        slug,
        previewSession,
      )
    ) {
      router.replace('/portal');
    }
  }, [isLoading, portalType, previewSession, router, selectedSchool?.slug, slug, user]);

  const handleTabChange = (tab: ParentTab) => {
    if (!slug) return;
    if (tab === 'more') {
      setMoreSheetOpen((open) => !open);
      return;
    }

    setMoreSheetOpen(false);
    if (tab === 'home') {
      router.replace(parentTabRoute(slug, 'home'));
      return;
    }
    if (tab === 'billing') {
      router.replace(parentTabRoute(slug, 'billing'));
      return;
    }
    if (tab === 'messages') {
      router.replace(parentTabRoute(slug, 'messages'));
      return;
    }
    router.replace(parentTabRoute(slug, 'calendar'));
  };

  const handleSelectMoreItem = (itemId: ParentMoreMenuItemId) => {
    setMoreSheetOpen(false);
    if (!slug) return;
    const target = parentMoreRoute(slug, itemId);
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
    const target = parentAccountRoute(slug);
    if (!pathname.includes('/more/account')) {
      const isMainTab = pathTab !== null && pathTab !== 'more';
      if (isMainTab) {
        router.replace(target);
      } else {
        router.push(target);
      }
    }
  };

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  if (isLoading || !organization) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Story.paper }]}>
      <StatusBar style="dark" />
      {isPreview ? <PortalPreviewBanner onExit={() => void exitPreview()} /> : null}
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <AnimatedTabContent transitionKey={showTabBar ? pathTab : null}>
          <Slot />
        </AnimatedTabContent>
      </View>
      {showTabBar && activeTab ? (
        <ParentFloatingTabBar
          activeTab={activeTab}
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
    </SafeAreaView>
  );
}

export default function ParentLayout() {
  const { selectedSchool, user, isLoading } = useAuth();
  const { isPreview } = usePortalPreview();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  const [loadedOrg, setLoadedOrg] = useState(organization);
  const [orgLoadState, setOrgLoadState] = useState<'loading' | 'ready' | 'failed'>(
    organization ? 'ready' : 'loading',
  );

  useRecoverableAuthRedirect(!user, isLoading);

  useEffect(() => {
    if (!user) {
      setLoadedOrg(null);
      setOrgLoadState('loading');
    }
  }, [user]);

  useEffect(() => {
    if (organization) {
      setLoadedOrg(organization);
      setOrgLoadState('ready');
      return;
    }
    if (!slug) return;

    setOrgLoadState('loading');
    void fetchOrganizationBySlug(slug).then((org) => {
      if (org) {
        setLoadedOrg(org);
        setOrgLoadState('ready');
        return;
      }
      setOrgLoadState('failed');
    });
  }, [organization, slug]);

  useEffect(() => {
    if (orgLoadState !== 'failed') return;
    router.replace('/portal');
  }, [orgLoadState, router]);

  if (!loadedOrg) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={Story.primary} />
      </SafeAreaView>
    );
  }

  const branding = toOrganizationBranding(loadedOrg.branding);
  const authReady = !isLoading && Boolean(user);

  return (
    <SchoolAdminThemeProvider branding={branding}>
      <ParentThemeProvider branding={branding}>
        <ParentHomeProvider
          organizationId={loadedOrg.id}
          slug={loadedOrg.slug}
          authReady={authReady}>
          <ParentBillingProvider
            organizationId={loadedOrg.id}
            slug={loadedOrg.slug}
            authReady={authReady}>
            <ParentCommitteesProvider
              organizationId={loadedOrg.id}
              slug={loadedOrg.slug}
              authReady={authReady}>
              <ParentClassroomSignupsProvider
                organizationId={loadedOrg.id}
                slug={loadedOrg.slug}
                authReady={authReady}>
                <ParentFridayBranchProvider
                  organizationId={loadedOrg.id}
                  slug={loadedOrg.slug}
                  authReady={authReady}>
                <ParentFormsDocumentsProvider
                  organizationId={loadedOrg.id}
                  slug={loadedOrg.slug}
                  authReady={authReady}>
                <ParentCalendarProvider
                  organizationId={loadedOrg.id}
                  slug={loadedOrg.slug}
                  authReady={authReady}>
                  <MessagesRealtimeProvider organizationId={loadedOrg.id} enabled={!isPreview}>
                    <ParentMessagesInboxProvider
                      organizationId={loadedOrg.id}
                      schoolName={loadedOrg.name}
                      authReady={authReady}>
                      <MessagesUnreadProvider
                        organizationId={loadedOrg.id}
                        schoolName={loadedOrg.name}
                        fetchUnreadCount={fetchParentMessagesUnreadCount}>
                        <ParentMessagesInboxRealtimeBridge />
                        <ParentLayoutContent />
                      </MessagesUnreadProvider>
                    </ParentMessagesInboxProvider>
                  </MessagesRealtimeProvider>
                </ParentCalendarProvider>
                </ParentFormsDocumentsProvider>
                </ParentFridayBranchProvider>
              </ParentClassroomSignupsProvider>
            </ParentCommitteesProvider>
          </ParentBillingProvider>
        </ParentHomeProvider>
      </ParentThemeProvider>
    </SchoolAdminThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Story.paper,
  },
  content: {
    flex: 1,
  },
});
