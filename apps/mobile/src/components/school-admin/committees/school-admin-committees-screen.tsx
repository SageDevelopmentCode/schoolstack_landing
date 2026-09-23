import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { SchoolAdminCommitteeActivityFeed } from '@/components/school-admin/committees/school-admin-committee-activity-feed';
import { SchoolAdminCommitteeActivityFeedSkeleton } from '@/components/school-admin/committees/school-admin-committee-activity-feed-skeleton';
import { SchoolAdminCommitteeJoinRequestsSection } from '@/components/school-admin/committees/school-admin-committee-join-requests-section';
import { SchoolAdminCreateCommitteeSheet } from '@/components/school-admin/committees/school-admin-create-committee-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryPillNav, type StoryPillNavItem } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useSchoolAdminCommittees } from '@/contexts/school-admin-committees-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { fetchAdminCommitteeActivity } from '@/lib/school-admin-api';
import {
  deriveCommitteeRosterMetrics,
  filterCommitteesByRosterFilter,
  type CommitteeRosterFilter,
} from '@/lib/school-admin/committees/roster-metrics';
import { schoolAdminCommitteeWorkspaceRoute } from '@/lib/school-admin/school-admin-nav';
import type { CommitteeActivityItem, CommitteeListItem } from '@/lib/parent/parent-committees-types';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

type SchoolAdminCommitteesScreenProps = {
  slug: string;
  organizationId: string;
};

type SchoolAdminCommitteesTab = 'committees' | 'join_requests' | 'activity';

type MetricAccent = 'forest' | 'sky' | 'gold' | 'berry';

const ACCENT_COLORS: Record<MetricAccent, string> = {
  forest: '#315E4F',
  sky: '#8ABAC6',
  gold: '#E4BD65',
  berry: '#B66A83',
};

function CommitteeMetricCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: MetricAccent;
}) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <Text style={[styles.metricValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

function CommitteeListCard({
  committee,
  onPress,
}: {
  committee: CommitteeListItem;
  onPress: () => void;
}) {
  const theme = useParentTheme();
  const statusTone =
    committee.status === 'active' ? 'success' : committee.status === 'archived' ? 'info' : 'warning';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <StoryCard compact style={styles.committeeCard}>
        <View style={styles.committeeHeader}>
          <Text style={[styles.committeeName, { color: theme.ink }]}>{committee.name}</Text>
          <StoryChip tone={statusTone} label={committee.status} />
        </View>
        <Text style={[styles.committeeDescription, { color: theme.muted }]} numberOfLines={2}>
          {committee.description}
        </Text>
        <View style={styles.committeeMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={theme.muted} />
            <Text style={[styles.metaCopy, { color: theme.muted }]}>
              {committee.memberCount} member{committee.memberCount === 1 ? '' : 's'}
            </Text>
          </View>
          <Text style={[styles.metaCopy, { color: theme.muted }]}>{committee.termLabel}</Text>
        </View>
      </StoryCard>
    </Pressable>
  );
}

export function SchoolAdminCommitteesScreen({ slug, organizationId }: SchoolAdminCommitteesScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const {
    committees,
    templates,
    pendingRequestCount,
    isLoading,
    isRefreshing,
    error,
    hasLoaded,
    refresh,
  } = useSchoolAdminCommittees();

  const [activeTab, setActiveTab] = useState<SchoolAdminCommitteesTab>('committees');
  const [mountedTabs, setMountedTabs] = useState<Set<SchoolAdminCommitteesTab>>(
    () => new Set(['committees']),
  );
  const [rosterFilter, setRosterFilter] = useState<CommitteeRosterFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [orgActivityItems, setOrgActivityItems] = useState<CommitteeActivityItem[]>([]);
  const [loadingOrgActivity, setLoadingOrgActivity] = useState(false);
  const [hasLoadedOrgActivity, setHasLoadedOrgActivity] = useState(false);
  const [joinRequestsRefreshKey, setJoinRequestsRefreshKey] = useState(0);

  const activityMounted = mountedTabs.has('activity');

  const metrics = useMemo(
    () => deriveCommitteeRosterMetrics(committees, pendingRequestCount),
    [committees, pendingRequestCount],
  );

  const filteredCommittees = useMemo(
    () => filterCommitteesByRosterFilter(committees, rosterFilter),
    [committees, rosterFilter],
  );

  const navItems = useMemo((): StoryPillNavItem[] => {
    const joinRequestsLabel =
      pendingRequestCount > 0 ? `Join requests · ${pendingRequestCount}` : 'Join requests';
    return [
      { key: 'committees', label: 'Committees', testID: 'school-admin-committees-nav' },
      {
        key: 'join_requests',
        label: joinRequestsLabel,
        testID: 'school-admin-committees-join-requests-nav',
      },
      { key: 'activity', label: 'Activity', testID: 'school-admin-committees-activity-nav' },
    ];
  }, [pendingRequestCount]);

  const handleTabChange = useCallback((key: string) => {
    const tab = key as SchoolAdminCommitteesTab;
    setActiveTab(tab);
    setMountedTabs((current) => {
      if (current.has(tab)) return current;
      const next = new Set(current);
      next.add(tab);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!activityMounted) return;
    setHasLoadedOrgActivity(false);
    setLoadingOrgActivity(true);
  }, [activityMounted, organizationId, slug]);

  useEffect(() => {
    if (!activityMounted) return;

    let cancelled = false;
    (async () => {
      try {
        const items = await fetchAdminCommitteeActivity(organizationId, slug, { limit: 12 });
        if (!cancelled) setOrgActivityItems(items);
      } catch (activityError) {
        reportError('committees.activity.org_load', activityError);
        if (!cancelled) setOrgActivityItems([]);
      } finally {
        if (!cancelled) {
          setLoadingOrgActivity(false);
          setHasLoadedOrgActivity(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activityMounted, organizationId, reportError, slug]);

  const refreshOrgActivity = useCallback(async () => {
    try {
      const items = await fetchAdminCommitteeActivity(organizationId, slug, { limit: 12 });
      setOrgActivityItems(items);
    } catch (activityError) {
      reportError('committees.activity.org_load', activityError);
      setOrgActivityItems([]);
    }
  }, [organizationId, reportError, slug]);

  const handleRefresh = useCallback(() => {
    void refresh();
    setJoinRequestsRefreshKey((current) => current + 1);
    if (activityMounted) {
      void refreshOrgActivity();
    }
  }, [activityMounted, refresh, refreshOrgActivity]);

  const handleOpenCommittee = useCallback(
    (committeeId: string, section?: string) => {
      router.push(schoolAdminCommitteeWorkspaceRoute(slug, committeeId, section) as Href);
    },
    [router, slug],
  );

  const handleCreated = useCallback(
    (committee: { id: string }) => {
      void refresh({ silent: true });
      handleOpenCommittee(committee.id, 'home');
    },
    [handleOpenCommittee, refresh],
  );

  const handleJoinRequestsChanged = useCallback(() => {
    void refresh({ silent: true });
  }, [refresh]);

  const handleActivityItemPress = useCallback(
    (item: CommitteeActivityItem) => {
      if (!item.committeeId) return;
      handleOpenCommittee(item.committeeId, 'activity');
    },
    [handleOpenCommittee],
  );

  const subtitleParts: string[] = [];
  if (metrics.activeCount > 0) {
    subtitleParts.push(
      `${metrics.activeCount} active committee${metrics.activeCount === 1 ? '' : 's'}`,
    );
  }
  if (metrics.pendingJoinRequests > 0) {
    subtitleParts.push(
      `${metrics.pendingJoinRequests} pending join request${metrics.pendingJoinRequests === 1 ? '' : 's'}`,
    );
  }
  const subtitle =
    subtitleParts.join(' · ') ||
    'Structured parent workspaces for volunteer groups, coordinators, and festival teams.';

  const committeesListHeader = (
    <View style={styles.committeesTabHeader}>
      {committees.length > 0 ? (
        <View style={styles.metricsGrid}>
          <CommitteeMetricCard value={metrics.activeCount} label="Active committees" accent="forest" />
          <CommitteeMetricCard
            value={metrics.totalVolunteers}
            label="Total volunteers"
            accent="sky"
          />
          <CommitteeMetricCard
            value={metrics.pendingJoinRequests}
            label="Pending join requests"
            accent="gold"
          />
          <CommitteeMetricCard
            value={metrics.archivedCount}
            label="Archived committees"
            accent="berry"
          />
        </View>
      ) : null}

      {metrics.pendingJoinRequests > 0 ? (
        <StoryCard compact style={styles.attentionBanner}>
          <Text style={styles.attentionCopy}>
            <Text style={styles.attentionBold}>Needs attention:</Text> {metrics.pendingJoinRequests}{' '}
            join request{metrics.pendingJoinRequests === 1 ? '' : 's'} waiting for review.
          </Text>
          <StoryButton
            label="Review requests →"
            variant="soft"
            previewSafe
            onPress={() => handleTabChange('join_requests')}
          />
        </StoryCard>
      ) : null}

      {committees.length > 0 ? (
        <View style={styles.filterRow}>
          <AdmissionsFilterPill
            active={rosterFilter === 'all'}
            label="All"
            count={metrics.totalCount}
            onPress={() => setRosterFilter('all')}
          />
          <AdmissionsFilterPill
            active={rosterFilter === 'active'}
            label="Active"
            count={metrics.activeCount}
            onPress={() => setRosterFilter('active')}
          />
          <AdmissionsFilterPill
            active={rosterFilter === 'archived'}
            label="Archived"
            count={metrics.archivedCount}
            onPress={() => setRosterFilter('archived')}
          />
        </View>
      ) : null}
    </View>
  );

  if (isLoading && !hasLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
        </Pressable>

        <Animated.View entering={FadeInDown.duration(350)} style={styles.titleBlock}>
          <StorySectionKicker>My School</StorySectionKicker>
          <View style={styles.titleRow}>
            <StoryDisplayHeading size="display">Committees</StoryDisplayHeading>
            <StoryButton label="Create" onPress={() => setCreateOpen(true)} />
          </View>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
        </Animated.View>

        {error ? <StoryErrorBanner message={error} /> : null}

        <StoryPillNav
          fullWidth
          items={navItems}
          activeKey={activeTab}
          onChange={handleTabChange}
          accessibilityLabel="Committee sections"
        />
      </View>

      <View style={styles.tabPanels}>
        {mountedTabs.has('committees') ? (
          <View
            style={[styles.tabPanel, activeTab !== 'committees' && styles.tabPanelHidden]}
            accessibilityElementsHidden={activeTab !== 'committees'}
            importantForAccessibility={activeTab === 'committees' ? 'auto' : 'no-hide-descendants'}>
            <FlatList
              data={filteredCommittees}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListHeaderComponent={committeesListHeader}
              ListEmptyComponent={
                <StoryCard compact style={styles.emptyCard}>
                  <Text style={[styles.emptyTitle, { color: theme.ink }]}>No committees yet</Text>
                  <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                    Create a committee workspace from a template to get started.
                  </Text>
                  <StoryButton label="Create committee" onPress={() => setCreateOpen(true)} />
                </StoryCard>
              }
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.primary}
                />
              }
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
                  <CommitteeListCard
                    committee={item}
                    onPress={() => handleOpenCommittee(item.id, 'home')}
                  />
                </Animated.View>
              )}
            />
          </View>
        ) : null}

        {mountedTabs.has('join_requests') ? (
          <View
            style={[styles.tabPanel, activeTab !== 'join_requests' && styles.tabPanelHidden]}
            accessibilityElementsHidden={activeTab !== 'join_requests'}
            importantForAccessibility={
              activeTab === 'join_requests' ? 'auto' : 'no-hide-descendants'
            }>
            <ScrollView
              contentContainerStyle={styles.tabScrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.primary}
                />
              }>
              <SchoolAdminCommitteeJoinRequestsSection
                embedded
                organizationId={organizationId}
                schoolSlug={slug}
                refreshKey={joinRequestsRefreshKey}
                onChanged={handleJoinRequestsChanged}
              />
            </ScrollView>
          </View>
        ) : null}

        {mountedTabs.has('activity') ? (
          <View
            style={[styles.tabPanel, activeTab !== 'activity' && styles.tabPanelHidden]}
            accessibilityElementsHidden={activeTab !== 'activity'}
            importantForAccessibility={activeTab === 'activity' ? 'auto' : 'no-hide-descendants'}>
            <ScrollView
              contentContainerStyle={styles.tabScrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.primary}
                />
              }>
              <StoryCard compact style={styles.activityCard}>
                {loadingOrgActivity && !hasLoadedOrgActivity ? (
                  <SchoolAdminCommitteeActivityFeedSkeleton
                    title="Recent activity across committees"
                  />
                ) : (
                  <SchoolAdminCommitteeActivityFeed
                    items={orgActivityItems}
                    showCommitteeName
                    title="Recent activity across committees"
                    onItemPress={handleActivityItemPress}
                  />
                )}
              </StoryCard>
            </ScrollView>
          </View>
        ) : null}
      </View>

      <SchoolAdminCreateCommitteeSheet
        visible={createOpen}
        organizationId={organizationId}
        templates={templates}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Story.paper,
  },
  screenHeader: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.three,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
  },
  titleBlock: {
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  tabPanels: {
    flex: 1,
  },
  tabPanel: {
    flex: 1,
  },
  tabPanelHidden: {
    display: 'none',
  },
  tabScrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  committeesTabHeader: {
    gap: Spacing.four,
    paddingBottom: Spacing.three,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: StoryCardPadding,
    gap: Spacing.one,
    overflow: 'hidden',
  },
  accentBar: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  metricValue: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  metricLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  attentionBanner: {
    padding: StoryCardPadding,
    gap: Spacing.two,
    backgroundColor: '#EAF4EB',
    borderColor: '#C7DFCB',
  },
  attentionCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#42694F',
    lineHeight: 18,
  },
  attentionBold: {
    fontFamily: StoryFonts.bodySemiBold,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
  committeeCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  committeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  committeeName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  committeeDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  committeeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  activityCard: {
    padding: StoryCardPadding,
  },
  emptyCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
