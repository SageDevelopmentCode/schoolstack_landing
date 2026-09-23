import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { PortalPreviewBanner } from '@/components/platform-admin/portal-preview-banner';
import { MoreMenuSheet } from '@/components/school-admin/more-menu-sheet';
import {
  FLOATING_TAB_BAR_HEIGHT,
  SchoolAdminFloatingTabBar,
  type SchoolAdminTab,
} from '@/components/school-admin/school-admin-floating-tab-bar';
import { MessagesRealtimeProvider, useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { MessagesUnreadProvider, useMessagesUnread } from '@/contexts/messages-unread-context';
import {
  SchoolAdminMessagesInboxProvider,
  useSchoolAdminMessagesInbox,
} from '@/contexts/school-admin-messages-inbox-context';
import { SchoolAdminCommitteesProvider } from '@/contexts/school-admin-committees-context';
import { SchoolAdminStudentsProvider } from '@/contexts/school-admin-students-context';
import { SchoolAdminSubmissionsProvider } from '@/contexts/school-admin-submissions-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';
import { fetchMessagesUnreadCount } from '@/lib/messages/api';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import { isPortalSessionAllowed } from '@/lib/platform-admin/portal-preview-layout';
import { useExitPortalPreviewNavigation, usePortalPreview } from '@/lib/portal-preview-gating';

function getActiveTab(pathname: string): SchoolAdminTab | null {
  if (/\/submissions\/[^/]+$/.test(pathname)) return null;
  if (/\/students\/[^/]+$/.test(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/staff\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/classrooms\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/committees\/[^/]+$/.test(pathname)) return null;
  if (pathname.includes('/more')) return 'more';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/students')) return 'students';
  if (pathname.includes('/admissions/submissions')) return 'admissions';
  if (pathname.includes('/dashboard')) return 'dashboard';
  return null;
}

function SchoolAdminMessagesInboxRealtimeBridge() {
  const { refresh } = useSchoolAdminMessagesInbox();
  const { subscribeMessagesUpdated } = useMessagesRealtime();

  useEffect(() => {
    return subscribeMessagesUpdated(() => {
      void refresh({ silent: true });
    });
  }, [refresh, subscribeMessagesUpdated]);

  return null;
}

function SchoolAdminLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAdminTheme();
  const { unreadCount, refreshUnreadCount } = useMessagesUnread();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    user,
    selectedSchool,
    portalType,
    isPlatformAdminSession,
    previewSession,
    isLoading,
    enterSchoolAsPlatformAdmin,
  } = useAuth();
  const { isPreview } = usePortalPreview();
  const exitPreview = useExitPortalPreviewNavigation();

  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const pathTab = getActiveTab(pathname);
  const activeTab = moreSheetOpen ? 'more' : pathTab;
  const showTabBar = pathTab !== null;

  useRecoverableAuthRedirect(Boolean(slug) && !user, isLoading || !slug);

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  useEffect(() => {
    if (isLoading || !slug || !user) return;

    if (
      isPortalSessionAllowed(
        portalType,
        selectedSchool?.slug,
        'school_admin',
        slug,
        previewSession,
      )
    ) {
      return;
    }

    void (async () => {
      const organization = await fetchOrganizationBySlug(slug);
      if (!organization) {
        router.replace(
          previewSession ? '/platform-admin/impersonate' : '/platform-admin/organizations',
        );
        return;
      }

      if (previewSession) {
        router.replace('/platform-admin/impersonate');
        return;
      }

      if (isPlatformAdminSession) {
        await enterSchoolAsPlatformAdmin(organization);
      } else {
        router.replace('/login');
      }
    })();
  }, [
    enterSchoolAsPlatformAdmin,
    isLoading,
    isPlatformAdminSession,
    portalType,
    previewSession,
    router,
    selectedSchool?.slug,
    slug,
    user,
  ]);

  const handleTabChange = (tab: SchoolAdminTab) => {
    if (!slug) return;
    if (tab === 'more') {
      setMoreSheetOpen((open) => !open);
      return;
    }

    setMoreSheetOpen(false);
    if (tab === 'dashboard') {
      router.replace(`/school-admin/${slug}/dashboard`);
      return;
    }
    if (tab === 'students') {
      router.replace(`/school-admin/${slug}/students`);
      return;
    }
    if (tab === 'messages') {
      router.replace(`/school-admin/${slug}/messages`);
      return;
    }
    router.replace(`/school-admin/${slug}/admissions/submissions`);
  };

  const handleSelectMoreItem = (
    itemId:
      | 'transactions'
      | 'schedule'
      | 'staff'
      | 'classrooms'
      | 'bulletin'
      | 'attendance'
      | 'committees',
  ) => {
    setMoreSheetOpen(false);
    if (!slug) return;

    const routes = {
      transactions: `/school-admin/${slug}/more/transactions`,
      schedule: `/school-admin/${slug}/more/schedule`,
      staff: `/school-admin/${slug}/more/staff`,
      classrooms: `/school-admin/${slug}/more/classrooms`,
      bulletin: `/school-admin/${slug}/more/bulletin`,
      attendance: `/school-admin/${slug}/more/attendance`,
      committees: `/school-admin/${slug}/more/committees`,
    } as const;

    const target = routes[itemId];
    const pathSegment =
      itemId === 'staff' || itemId === 'classrooms' ? `/more/${itemId}` : `/more/${itemId}`;

    if (!pathname.includes(pathSegment)) {
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
      {isPreview ? <PortalPreviewBanner onExit={() => void exitPreview()} /> : null}
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <AnimatedTabContent transitionKey={showTabBar ? pathTab : null}>
          <Slot />
        </AnimatedTabContent>
      </View>
      {showTabBar && activeTab ? (
        <SchoolAdminFloatingTabBar
          activeTab={activeTab}
          onChange={handleTabChange}
          messagesUnreadCount={unreadCount}
        />
      ) : null}
      <MoreMenuSheet
        visible={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        onSelect={handleSelectMoreItem}
      />
    </SafeAreaView>
  );
}

export default function SchoolAdminLayout() {
  const { selectedSchool, user, isLoading } = useAuth();
  const { isPreview } = usePortalPreview();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  useRecoverableAuthRedirect(!user, isLoading);

  if (!isLoading && !user) {
    return null;
  }

  if (!organization) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#2E4A3C" />
      </SafeAreaView>
    );
  }

  const branding = toOrganizationBranding(organization.branding);

  return (
    <SchoolAdminThemeProvider branding={branding}>
      <ParentThemeProvider branding={branding}>
        <MessagesRealtimeProvider organizationId={organization.id} enabled={!isPreview}>
          <SchoolAdminSubmissionsProvider organizationId={organization.id}>
            <SchoolAdminStudentsProvider organizationId={organization.id}>
              <SchoolAdminCommitteesProvider organizationId={organization.id}>
              <SchoolAdminMessagesInboxProvider
                organizationId={organization.id}
                schoolName={organization.name}>
                <MessagesUnreadProvider
                  organizationId={organization.id}
                  schoolName={organization.name}
                  fetchUnreadCount={fetchMessagesUnreadCount}>
                  <SchoolAdminMessagesInboxRealtimeBridge />
                  <SchoolAdminLayoutContent />
                </MessagesUnreadProvider>
              </SchoolAdminMessagesInboxProvider>
              </SchoolAdminCommitteesProvider>
            </SchoolAdminStudentsProvider>
          </SchoolAdminSubmissionsProvider>
        </MessagesRealtimeProvider>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});
