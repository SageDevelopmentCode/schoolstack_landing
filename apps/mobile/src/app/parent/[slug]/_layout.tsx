import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { ParentMoreMenuSheet } from '@/components/parent/parent-more-menu-sheet';
import {
  PARENT_FLOATING_TAB_BAR_HEIGHT,
  ParentFloatingTabBar,
} from '@/components/parent/parent-floating-tab-bar';
import { MessagesRealtimeProvider, useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { MessagesUnreadProvider, useMessagesUnread } from '@/contexts/messages-unread-context';
import { ParentBillingProvider } from '@/contexts/parent-billing-context';
import { ParentCalendarProvider } from '@/contexts/parent-calendar-context';
import { ParentHomeProvider } from '@/contexts/parent-home-context';
import { ParentMessagesInboxProvider, useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import {
  isParentChildDetailPath,
  parentAccountRoute,
  parentMoreRoute,
  parentTabRoute,
  type ParentMoreMenuItemId,
  type ParentTab,
} from '@/lib/parent/parent-nav';
import { fetchParentMessagesUnreadCount } from '@/lib/parent/parent-portal-api';

function getActiveTab(pathname: string): ParentTab | null {
  if (isParentChildDetailPath(pathname)) return null;
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
  const { user, selectedSchool, portalType, isLoading } = useAuth();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const pathTab = getActiveTab(pathname);
  const activeTab = moreSheetOpen ? 'more' : pathTab;
  const showTabBar = pathTab !== null;

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  useEffect(() => {
    if (isLoading || !slug) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (portalType !== 'parent' || selectedSchool?.slug !== slug) {
      router.replace('/portal');
    }
  }, [isLoading, portalType, router, selectedSchool?.slug, slug, user]);

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
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style="dark" />
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
  const { selectedSchool } = useAuth();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  const [loadedOrg, setLoadedOrg] = useState(organization);

  useEffect(() => {
    if (organization) {
      setLoadedOrg(organization);
      return;
    }
    if (!slug) return;
    void fetchOrganizationBySlug(slug).then((org) => {
      if (org) setLoadedOrg(org);
    });
  }, [organization, slug]);

  if (!loadedOrg) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#2E4A3C" />
      </SafeAreaView>
    );
  }

  return (
    <SchoolAdminThemeProvider branding={toOrganizationBranding(loadedOrg.branding)}>
      <ParentHomeProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
        <ParentBillingProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
          <ParentCalendarProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
            <MessagesRealtimeProvider organizationId={loadedOrg.id}>
              <ParentMessagesInboxProvider
                organizationId={loadedOrg.id}
                schoolName={loadedOrg.name}>
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
        </ParentBillingProvider>
      </ParentHomeProvider>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});
