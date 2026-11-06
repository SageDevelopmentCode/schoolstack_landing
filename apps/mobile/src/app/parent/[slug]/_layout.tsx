import { useObserve } from 'expo-observe';
import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
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
import { SchoolAdminThemeProvider } from '@/contexts/admin-theme-context';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import {
  useCompletePortalTransitionOnMount,
  useReleaseAccountPortalSwitchOnBlur,
} from '@/contexts/portal-transition-context';
import { usePortalOrganization } from '@/hooks/use-portal-organization';
import { toOrganizationBranding } from '@/lib/organizations';
import { useRecoverableAuthRedirect } from '@/lib/auth/use-recoverable-auth-redirect';
import { fetchParentMessagesUnreadCount } from '@/lib/parent/parent-portal-api';
import { isPortalSessionAllowed } from '@/lib/platform-admin/portal-preview-layout';
import { usePortalPreview } from '@/lib/portal-preview-gating';

function ParentPortalContextBridge({
  children,
  authReady,
  organizationId,
  slug,
}: {
  children: React.ReactNode;
  authReady: boolean;
  organizationId: string;
  slug: string;
}) {
  const { data: homeData } = useParentHome();

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
  const isFocused = useIsFocused();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { markInteractive } = useObserve();
  const {
    user,
    selectedSchool,
    portalType,
    previewSession,
    isLoading,
    accountPortalSwitchInProgress,
  } = useAuth();

  useRecoverableAuthRedirect(Boolean(slug) && !user, isLoading || !slug);

  useEffect(() => {
    if (!isFocused || isLoading || !slug || !user || accountPortalSwitchInProgress) return;

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
  }, [
    accountPortalSwitchInProgress,
    isFocused,
    isLoading,
    portalType,
    previewSession,
    router,
    selectedSchool?.slug,
    slug,
    user,
  ]);

  const organization = selectedSchool?.slug === slug ? selectedSchool : null;

  useCompletePortalTransitionOnMount('parent');
  useReleaseAccountPortalSwitchOnBlur();

  useEffect(() => {
    if (isLoading || !organization) return;
    markInteractive();
  }, [isLoading, markInteractive, organization]);

  if (isLoading || !organization) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ParentHomeSkeleton />
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
  const { user, isLoading, previewSession } = useAuth();
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

  const billingCacheScope = useMemo(() => {
    if (previewSession?.portal !== 'parent' || !previewSession.familyId) {
      return undefined;
    }
    return {
      familyId: previewSession.familyId,
      ...(previewSession.guardianId ? { guardianId: previewSession.guardianId } : {}),
    };
  }, [previewSession]);

  if (!orgReady) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ParentHomeSkeleton />
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
          <ParentPortalContextBridge
            authReady={authReady}
            organizationId={loadedOrg.id}
            slug={loadedOrg.slug}>
            <ParentBillingProvider
              organizationId={loadedOrg.id}
              slug={loadedOrg.slug}
              authReady={authReady}
              billingCacheScope={billingCacheScope}>
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
