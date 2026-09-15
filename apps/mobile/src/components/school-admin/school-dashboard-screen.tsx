import type { User } from '@supabase/supabase-js';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/primary-button';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { AdminActivityFeedCard } from '@/components/school-admin/dashboard/admin-activity-feed-card';
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
  SchoolAdminActivityNotification,
} from '@/lib/school-admin/dashboard-summary-types';
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
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

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
  const { reportError } = useMobileErrorReporter(organizationId);
  const [summary, setSummary] = useState<MobileAdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const stripePollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useAuthRequiredRedirect(error);

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
      } catch (loadError) {
        reportError('school_admin_dashboard_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, reportError, slug],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
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

  const handleActivityItem = useCallback(
    (item: SchoolAdminActivityNotification) => {
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

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadSummary(true)}
          tintColor={theme.accent}
        />
      }>
      <Animated.View entering={FadeInDown.duration(350)}>
        <AdminDashboardHeader
          schoolName={schoolName}
          userFirstName={userFirstNameFromMetadata(user ?? null)}
        />
      </Animated.View>

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

      <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.section}>
        <AdminActivityFeedCard items={summary.recentActivity} onPressItem={handleActivityItem} />
      </Animated.View>

      {summary.quickActions.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(240).duration(350)} style={styles.section}>
          <AdminQuickActionsCard actions={summary.quickActions} onPressLink={handleQuickActionLink} />
        </Animated.View>
      ) : null}

      {summary.featureAnnouncements.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(280).duration(350)} style={styles.section}>
          <AdminFeatureAnnouncementsCard announcements={summary.featureAnnouncements} />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(320).duration(350)} style={styles.section}>
        <AdminNeedHelpCard onPress={() => setSupportSheetOpen(true)} />
      </Animated.View>

      <AdminSupportRequestSheet
        visible={supportSheetOpen}
        onClose={() => setSupportSheetOpen(false)}
        organizationId={organizationId}
        slug={slug}
        userEmail={user?.email}
        sourcePagePath={`/school-admin/${slug}/dashboard`}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
