import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import { TeacherMoreMenuSheet } from '@/components/teacher/teacher-more-menu-sheet';
import {
  TEACHER_FLOATING_TAB_BAR_HEIGHT,
  TeacherFloatingTabBar,
} from '@/components/teacher/teacher-floating-tab-bar';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import {
  teacherAccountRoute,
  teacherMoreRoute,
  teacherTabRoute,
  type TeacherMoreMenuItemId,
  type TeacherTab,
} from '@/lib/teacher/teacher-nav';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';

function getActiveTab(pathname: string): TeacherTab | null {
  if (pathname.includes('/more')) return 'more';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/my-students')) return 'my-students';
  if (pathname.includes('/home')) return 'home';
  return null;
}

function TeacherLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAdminTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, selectedSchool, portalType, isLoading } = useAuth();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const pathTab = getActiveTab(pathname);
  const activeTab = moreSheetOpen ? 'more' : pathTab;
  const showTabBar = pathTab !== null;

  useRecoverableAuthRedirect(Boolean(slug) && !user, isLoading || !slug);

  useEffect(() => {
    if (isLoading || !slug || !user) return;

    if (portalType !== 'teacher' || selectedSchool?.slug !== slug) {
      router.replace('/portal');
    }
  }, [isLoading, portalType, router, selectedSchool?.slug, slug, user]);

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
        <TeacherFloatingTabBar activeTab={activeTab} onChange={handleTabChange} />
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
        <TeacherLayoutContent />
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
