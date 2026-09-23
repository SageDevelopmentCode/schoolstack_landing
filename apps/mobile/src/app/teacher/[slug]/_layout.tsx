import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { PortalPreviewBanner } from '@/components/platform-admin/portal-preview-banner';
import { TeacherMoreMenuSheet } from '@/components/teacher/teacher-more-menu-sheet';
import { TeacherCalendarProvider } from '@/contexts/teacher-calendar-context';
import { TeacherCommitteesProvider } from '@/contexts/teacher-committees-context';
import { TeacherHomeProvider } from '@/contexts/teacher-home-context';
import {
  TEACHER_FLOATING_TAB_BAR_HEIGHT,
  TeacherFloatingTabBar,
} from '@/components/teacher/teacher-floating-tab-bar';
import { MessagesRealtimeProvider, useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { MessagesUnreadProvider, useMessagesUnread } from '@/contexts/messages-unread-context';
import {
  TeacherMessagesInboxProvider,
  useTeacherMessagesInbox,
} from '@/contexts/teacher-messages-inbox-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import {
  fetchTeacherMessagesUnreadCount,
} from '@/lib/teacher/teacher-portal-api';
import {
  isTeacherBulletinDetailPath,
  isTeacherStudentDetailPath,
  teacherAccountRoute,
  teacherMoreRoute,
  teacherTabRoute,
  type TeacherMoreMenuItemId,
  type TeacherTab,
} from '@/lib/teacher/teacher-nav';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';
import { isPortalSessionAllowed } from '@/lib/platform-admin/portal-preview-layout';
import { useExitPortalPreviewNavigation, usePortalPreview } from '@/lib/portal-preview-gating';

function getActiveTab(pathname: string): TeacherTab | null {
  if (isTeacherStudentDetailPath(pathname)) return null;
  if (isTeacherBulletinDetailPath(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;
  if (pathname.includes('/more')) return 'more';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/my-students')) return 'my-students';
  if (pathname.includes('/home')) return 'home';
  return null;
}

function TeacherMessagesInboxRealtimeBridge() {
  const { refresh } = useTeacherMessagesInbox();
  const { subscribeMessagesUpdated } = useMessagesRealtime();

  useEffect(() => {
    return subscribeMessagesUpdated(() => {
      void refresh({ silent: true });
    });
  }, [refresh, subscribeMessagesUpdated]);

  return null;
}

function TeacherLayoutContent() {
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
        'teacher',
        slug,
        previewSession,
      )
    ) {
      router.replace('/portal');
    }
  }, [isLoading, portalType, previewSession, router, selectedSchool?.slug, slug, user]);

  const handleTabChange = (tab: TeacherTab) => {
    if (!slug) return;
    if (tab === 'more') {
      setMoreSheetOpen((open) => !open);
      return;
    }

    setMoreSheetOpen(false);
    router.replace(teacherTabRoute(slug, tab));
  };

  const handleSelectMoreItem = (itemId: TeacherMoreMenuItemId) => {
    setMoreSheetOpen(false);
    if (!slug) return;
    const target = teacherMoreRoute(slug, itemId);
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
    const target = teacherAccountRoute(slug);
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
          showTabBar ? { paddingBottom: TEACHER_FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <AnimatedTabContent transitionKey={showTabBar ? pathTab : null}>
          <Slot />
        </AnimatedTabContent>
      </View>
      {showTabBar && activeTab ? (
        <TeacherFloatingTabBar
          activeTab={activeTab}
          onChange={handleTabChange}
          messagesUnreadCount={unreadCount}
        />
      ) : null}
      <TeacherMoreMenuSheet
        visible={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        onSelect={handleSelectMoreItem}
        onSelectAccount={handleSelectAccount}
      />
    </SafeAreaView>
  );
}

export default function TeacherLayout() {
  const { selectedSchool, user, isLoading } = useAuth();
  const { isPreview } = usePortalPreview();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  const [loadedOrg, setLoadedOrg] = useState(organization);

  useRecoverableAuthRedirect(!user, isLoading);

  useEffect(() => {
    if (!user) {
      setLoadedOrg(null);
    }
  }, [user]);

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
        <ActivityIndicator color={Story.primary} />
      </SafeAreaView>
    );
  }

  const branding = toOrganizationBranding(loadedOrg.branding);

  return (
    <SchoolAdminThemeProvider branding={branding}>
      <ParentThemeProvider branding={branding}>
        <TeacherHomeProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
          <TeacherCommitteesProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
            <TeacherCalendarProvider organizationId={loadedOrg.id} slug={loadedOrg.slug}>
              <MessagesRealtimeProvider organizationId={loadedOrg.id} enabled={!isPreview}>
                <TeacherMessagesInboxProvider
                  organizationId={loadedOrg.id}
                  schoolName={loadedOrg.name}>
                  <MessagesUnreadProvider
                    organizationId={loadedOrg.id}
                    schoolName={loadedOrg.name}
                    fetchUnreadCount={fetchTeacherMessagesUnreadCount}>
                    <TeacherMessagesInboxRealtimeBridge />
                    <TeacherLayoutContent />
                  </MessagesUnreadProvider>
                </TeacherMessagesInboxProvider>
              </MessagesRealtimeProvider>
            </TeacherCalendarProvider>
          </TeacherCommitteesProvider>
        </TeacherHomeProvider>
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
