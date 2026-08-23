import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SchoolAdminHeader } from '@/components/school-admin/school-admin-header';
import { MoreMenuSheet } from '@/components/school-admin/more-menu-sheet';
import {
  FLOATING_TAB_BAR_HEIGHT,
  SchoolAdminFloatingTabBar,
  type SchoolAdminTab,
} from '@/components/school-admin/school-admin-floating-tab-bar';
import { MessagesUnreadProvider, useMessagesUnread } from '@/contexts/messages-unread-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { fetchMessagesUnreadCount } from '@/lib/messages/api';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';

function getActiveTab(pathname: string): SchoolAdminTab | null {
  if (/\/submissions\/[^/]+$/.test(pathname)) return null;
  if (/\/students\/[^/]+$/.test(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/staff\/[^/]+$/.test(pathname)) return null;
  if (pathname.includes('/more')) return 'more';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/students')) return 'students';
  if (pathname.includes('/admissions/submissions')) return 'admissions';
  if (pathname.includes('/dashboard')) return 'dashboard';
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
    isLoading,
    enterSchoolAsPlatformAdmin,
    exitSchoolAdmin,
  } = useAuth();

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
      router.replace('/login/admin');
      return;
    }

    if (portalType !== 'school_admin' || selectedSchool?.slug !== slug) {
      void (async () => {
        const organization = await fetchOrganizationBySlug(slug);
        if (!organization) {
          router.replace('/platform-admin/organizations');
          return;
        }

        if (isPlatformAdminSession) {
          await enterSchoolAsPlatformAdmin(organization);
        } else {
          router.replace('/login');
        }
      })();
    }
  }, [
    enterSchoolAsPlatformAdmin,
    isLoading,
    isPlatformAdminSession,
    portalType,
    router,
    selectedSchool?.slug,
    slug,
    user,
  ]);

  const handleBackToOrganizations = async () => {
    await exitSchoolAdmin();
    router.replace('/platform-admin/organizations');
  };

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

  const handleSelectMoreItem = (itemId: 'transactions' | 'schedule' | 'staff') => {
    setMoreSheetOpen(false);
    if (!slug) return;
    if (itemId === 'transactions' && !pathname.includes('/more/transactions')) {
      router.push(`/school-admin/${slug}/more/transactions`);
      return;
    }
    if (itemId === 'schedule' && !pathname.includes('/more/schedule')) {
      router.push(`/school-admin/${slug}/more/schedule`);
      return;
    }
    if (itemId === 'staff' && !pathname.includes('/more/staff')) {
      router.push(`/school-admin/${slug}/more/staff`);
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
      {isPlatformAdminSession ? (
        <SchoolAdminHeader
          organization={organization}
          showBackToOrganizations={showTabBar}
          onBackToOrganizations={handleBackToOrganizations}
        />
      ) : null}
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <Slot />
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
  const { selectedSchool } = useAuth();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const organization = useMemo(() => {
    if (selectedSchool?.slug === slug) return selectedSchool;
    return null;
  }, [selectedSchool, slug]);

  if (!organization) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#2E4A3C" />
      </SafeAreaView>
    );
  }

  return (
    <SchoolAdminThemeProvider branding={toOrganizationBranding(organization.branding)}>
      <MessagesUnreadProvider
        organizationId={organization.id}
        schoolName={organization.name}
        fetchUnreadCount={fetchMessagesUnreadCount}>
        <SchoolAdminLayoutContent />
      </MessagesUnreadProvider>
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
