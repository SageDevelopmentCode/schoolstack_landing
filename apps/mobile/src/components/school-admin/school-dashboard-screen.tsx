import type { User } from '@supabase/supabase-js';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';
import { PrimaryButton } from '@/components/primary-button';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import { AdminActivityNotificationsSheet } from '@/components/school-admin/dashboard/admin-activity-notifications-sheet';
import { AdminDashboardHeader } from '@/components/school-admin/dashboard/admin-dashboard-header';
import { AdminDashboardSkeleton } from '@/components/school-admin/dashboard/admin-dashboard-skeleton';
import { AdminFeatureAnnouncementsCard } from '@/components/school-admin/dashboard/admin-feature-announcements-card';
import { AdminFocusQueueCard } from '@/components/school-admin/dashboard/admin-focus-queue-card';
import { AdminMetricCard } from '@/components/school-admin/dashboard/admin-metric-card';
import { AdminNeedHelpCard } from '@/components/school-admin/dashboard/admin-need-help-card';
import { AdminQuickActionsCard } from '@/components/school-admin/dashboard/admin-quick-actions-card';
import { AdminSupportRequestSheet } from '@/components/school-admin/dashboard/admin-support-request-sheet';
import {
  AdminSignalCard,
  AdminSignalEmptyCard,
} from '@/components/school-admin/dashboard/admin-signal-card';
import { SetupProgressBar } from '@/components/school-admin/setup-progress-bar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import type {
  DashboardFocusItem,
  DashboardQuickAction,
  MobileAdminDashboardSummary,
} from '@/lib/school-admin/dashboard-summary-types';
import { fetchActivityNotificationUnreadCount } from '@/lib/school-admin/fetch-activity-notifications';
import {
  fetchAdminDashboardSummary,
  refreshStripeConnectStatus,
} from '@/lib/school-admin/fetch-dashboard-summary';
import { filterMobileDashboardSummary } from '@/lib/school-admin/filter-mobile-dashboard-summary';
import { userFirstNameFromMetadata } from '@/lib/school-admin/greeting';
import {
  resolveSchoolAdminNativeRoute,
  schoolAdminSubmissionsRoute,
} from '@/lib/school-admin/school-admin-nav';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type SchoolDashboardTab = 'overview' | 'attendance';

const SCHOOL_DASHBOARD_TABS = [
  { id: 'overview' as const, label: 'Overview' },
  { id: 'attendance' as const, label: 'Attendance', icon: 'clipboard-outline' as const },
];

type SchoolDashboardScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  user?: User | null;
};

export function SchoolDashboardScreen({
  organizationId,
  slug,
  schoolName,
  user,
}: SchoolDashboardScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [homeTab, setHomeTab] = useState<SchoolDashboardTab>('overview');
  const [summary, setSummary] = useState<MobileAdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [activityUnreadCount, setActivityUnreadCount] = useState(0);
  const stripePollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useAuthRequiredRedirect(error);

  const loadActivityUnreadCount = useCallback(async () => {
    try {
      const count = await fetchActivityNotificationUnreadCount(organizationId);
      setActivityUnreadCount(count);
    } catch {
      // Keep the last known count on transient errors.
    }
  }, [organizationId]);

  const loadSummary = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const nextSummary = await fetchAdminDashboardSummary(organizationId, slug);
        setSummary(filterMobileDashboardSummary(slug, nextSummary));
        void loadActivityUnreadCount();
      } catch (loadError) {
        reportError('school_admin_dashboard_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadActivityUnreadCount, organizationId, reportError, slug],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
      void loadActivityUnreadCount();
    }, [loadActivityUnreadCount, loadSummary]),
  );

  const stripeStep = summary?.setupStatus.steps.find((step) => step.id === 'stripe');

  useEffect(() => {
    if (stripePollRef.current) {
      clearInterval(stripePollRef.current);
      stripePollRef.current = null;
    }

    if (stripeStep?.status !== 'in_progress') {
      return;
    }

    stripePollRef.current = setInterval(() => {
      void refreshStripeConnectStatus(organizationId)
        .then(() => loadSummary(true))
        .catch(() => {
          // Keep last known summary on polling errors.
        });
    }, 60_000);

    return () => {
      if (stripePollRef.current) {
        clearInterval(stripePollRef.current);
        stripePollRef.current = null;
      }
    };
  }, [loadSummary, organizationId, stripeStep?.status]);

  const navigateToHref = useCallback(
    (href: string) => {
      const route = resolveSchoolAdminNativeRoute(slug, href);
      if (route) {
        router.push(route as Href);
      }
    },
    [router, slug],
  );

  const handleFocusItem = useCallback(
    (item: DashboardFocusItem) => {
      navigateToHref(item.href);
    },
    [navigateToHref],
  );

  const handleQuickActionLink = useCallback(
    (action: Extract<DashboardQuickAction, { kind: 'link' }>) => {
      navigateToHref(action.href);
    },
    [navigateToHref],
  );

  const handleOpenAdmissions = useCallback(() => {
    router.replace(schoolAdminSubmissionsRoute(slug) as Href);
  }, [router, slug]);

  if (loading && !summary) {
    return <AdminDashboardSkeleton />;
  }

  if (error && !summary) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <PrimaryButton
          label="Try again"
          onPress={() => void loadSummary()}
          style={styles.retry}
        />
      </View>
    );
  }

  if (!summary) return null;

  const remaining = summary.setupStatus.totalCount - summary.setupStatus.completedCount;

  const header = (
    <AdminDashboardHeader
      userFirstName={userFirstNameFromMetadata(user ?? null)}
      unreadCount={activityUnreadCount}
      onPressBulletin={() => router.push(`/school-admin/${slug}/more/bulletin` as Href)}
      onPressHelp={() => setSupportSheetOpen(true)}
      onPressNotifications={() => setActivitySheetOpen(true)}
    />
  );

  const overviewBody = (
    <>
      {!summary.setupComplete ? (
        <Animated.View entering={FadeInDown.delay(40).duration(350)} style={styles.section}>
          <SetupProgressBar
            completed={summary.setupStatus.completedCount}
            total={summary.setupStatus.totalCount}
            label="Setup progress"
            subtitle={`${remaining} step${remaining === 1 ? '' : 's'} remaining before go-live`}
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.section}>
        <AdminFocusQueueCard items={summary.focusItems} onPressItem={handleFocusItem} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.section}>
        {summary.signal ? (
          <AdminSignalCard
            headline={summary.signal.headline}
            body={summary.signal.body}
            ctaLabel={summary.signal.ctaLabel}
            onPress={handleOpenAdmissions}
          />
        ) : (
          <AdminSignalEmptyCard />
        )}
      </Animated.View>

      {summary.metrics.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.metricsGrid}>
          {summary.metrics.map((metric) => (
            <AdminMetricCard key={metric.id} metric={metric} />
          ))}
        </Animated.View>
      ) : null}

      {summary.quickActions.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.section}>
          <AdminQuickActionsCard actions={summary.quickActions} onPressLink={handleQuickActionLink} />
        </Animated.View>
      ) : null}

      {summary.featureAnnouncements.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(240).duration(350)} style={styles.section}>
          <AdminFeatureAnnouncementsCard announcements={summary.featureAnnouncements} />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(280).duration(350)} style={styles.section}>
        <AdminNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
      </Animated.View>
    </>
  );

  const sheets = (
    <>
      <AdminActivityNotificationsSheet
        visible={activitySheetOpen}
        onClose={() => setActivitySheetOpen(false)}
        organizationId={organizationId}
        slug={slug}
        onMarkedRead={() => setActivityUnreadCount(0)}
      />

      <AdminSupportRequestSheet
        visible={supportSheetOpen}
        onClose={() => setSupportSheetOpen(false)}
        organizationId={organizationId}
        slug={slug}
        userEmail={user?.email}
        sourcePagePath={`/school-admin/${slug}/dashboard`}
      />
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar style={isPreview ? 'dark' : 'light'} />
      <Animated.View entering={FadeInDown.duration(350)}>{header}</Animated.View>

      <SubmissionStoryTabBar
        tabs={SCHOOL_DASHBOARD_TABS}
        activeTabId={homeTab}
        onChange={(tabId) => setHomeTab(tabId as SchoolDashboardTab)}
      />

      {homeTab === 'overview' ? (
        <ScrollView
          style={styles.tabScroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadSummary(true)}
              tintColor={theme.accent}
            />
          }>
          {overviewBody}
        </ScrollView>
      ) : (
        <AttendanceRosterPanel embedded active />
      )}

      {sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
  },
  retry: {
    marginTop: Spacing.three,
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.three,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
