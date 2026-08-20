import { Slot, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SchoolAdminHeader } from '@/components/school-admin/school-admin-header';
import {
  SchoolAdminFloatingTabBar,
  type SchoolAdminTab,
} from '@/components/school-admin/school-admin-floating-tab-bar';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import { toOrganizationBranding } from '@/lib/organizations';

const FLOATING_TAB_BAR_HEIGHT = 88;

function getActiveTab(pathname: string): SchoolAdminTab | null {
  if (/\/submissions\/[^/]+$/.test(pathname)) return null;
  if (pathname.includes('/admissions/submissions')) return 'admissions';
  if (pathname.includes('/dashboard')) return 'dashboard';
  return null;
}

function SchoolAdminLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAdminTheme();
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

  const activeTab = getActiveTab(pathname);
  const showTabBar = activeTab !== null;

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
    if (tab === 'dashboard') {
      router.replace(`/school-admin/${slug}/dashboard`);
      return;
    }
    router.replace(`/school-admin/${slug}/admissions/submissions`);
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
      <SchoolAdminHeader
        organization={organization}
        showBackToOrganizations={isPlatformAdminSession && showTabBar}
        onBackToOrganizations={handleBackToOrganizations}
      />
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <Slot />
      </View>
      {showTabBar && activeTab ? (
        <SchoolAdminFloatingTabBar activeTab={activeTab} onChange={handleTabChange} />
      ) : null}
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
      <SchoolAdminLayoutContent />
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
