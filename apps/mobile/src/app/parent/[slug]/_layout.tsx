import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ParentPortalShell } from '@/components/parent/parent-portal-shell';
import { ParentPortalContextProvider } from '@/contexts/parent-portal-context';
import { MessagesRealtimeProvider, useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { MessagesUnreadProvider } from '@/contexts/messages-unread-context';
import { ParentBillingProvider } from '@/contexts/parent-billing-context';
import { ParentCalendarProvider } from '@/contexts/parent-calendar-context';
import { ParentClassroomSignupsProvider } from '@/contexts/parent-classroom-signups-context';
import { ParentFormsDocumentsProvider } from '@/contexts/parent-forms-documents-context';
import { ParentFridayBranchProvider } from '@/contexts/parent-friday-branch-context';
import { ParentCommitteesProvider } from '@/contexts/parent-committees-context';
import { ParentHomeProvider, useParentHome } from '@/contexts/parent-home-context';
import { ParentMessagesInboxProvider, useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import { usePortalOrganization } from '@/hooks/use-portal-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';
import { fetchParentMessagesUnreadCount } from '@/lib/parent/parent-portal-api';
import { isPortalSessionAllowed } from '@/lib/platform-admin/portal-preview-layout';
import { usePortalPreview } from '@/lib/portal-preview-gating';

function ParentPortalContextBridge({
  children,
  authReady,
}: {
  children: React.ReactNode;
  authReady: boolean;
}) {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();
  const { data: homeData } = useParentHome();
  const organizationId = selectedSchool?.slug === slug ? selectedSchool.id : '';

  if (!slug || !organizationId) {
    return <>{children}</>;
  }

  return (
    <ParentPortalContextProvider
      organizationId={organizationId}
      slug={slug}
      authReady={authReady}
      mainPortalFeatures={homeData?.features}>
      {children}
    </ParentPortalContextProvider>
  );
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
  const theme = useAdminTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, selectedSchool, portalType, previewSession, isLoading } = useAuth();

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

  const organization = selectedSchool?.slug === slug ? selectedSchool : null;

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
      <ParentPortalShell />
    </SafeAreaView>
  );
}

export default function ParentLayout() {
  const { user, isLoading } = useAuth();
  const { isPreview } = usePortalPreview();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { organization: loadedOrg, status: orgLoadState } = usePortalOrganization(slug);

  useRecoverableAuthRedirect(!user, isLoading);

  useEffect(() => {
    if (orgLoadState !== 'failed') return;
    router.replace('/portal');
  }, [orgLoadState, router]);

  const orgReady =
    loadedOrg && loadedOrg.slug === slug && orgLoadState === 'ready';

  if (!orgReady) {
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
          <ParentPortalContextBridge authReady={authReady}>
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
          </ParentPortalContextBridge>
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
});
