import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { AdminCommitteeActivity } from '@/components/school-admin/committees/garden/admin-committee-activity';
import { AdminCreateCommitteeSheet, type CreateCommitteeInput } from '@/components/school-admin/committees/garden/admin-create-committee-sheet';
import { AdminJoinRequests } from '@/components/school-admin/committees/garden/admin-join-requests';
import { READ_ONLY_NOTICE, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import {
  AdminEmptyPanel,
  AdminFilterChips,
  AdminIconChip,
  AdminKpiTiles,
  AdminLeadStrip,
  AdminToolbarButton,
} from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { useSchoolAdminCommittees } from '@/contexts/school-admin-committees-context';
import { haptic } from '@/lib/haptics';
import { calmEnter } from '@/lib/motion/portal-motion';
import type { CommitteeActivityItem, CommitteeListItem } from '@/lib/parent/parent-committees-types';
import { fetchAdminCommitteeActivity } from '@/lib/school-admin-api';
import { createCommitteeFromTemplate } from '@/lib/school-admin/committees/mutations';
import { deriveCommitteeRosterMetrics, filterCommitteesByRosterFilter, type CommitteeRosterFilter } from '@/lib/school-admin/committees/roster-metrics';
import { schoolAdminCommitteeWorkspaceRoute } from '@/lib/school-admin/school-admin-nav';
import { getSupabaseClient } from '@/lib/supabase';

type Tab = 'committees' | 'join_requests' | 'activity';

const KPI_BARS = { active: '#2E4A3C', volunteers: '#7FA7D9', pending: '#E2B33C', archived: '#B5577A' } as const;

function statusTone(status: string): GChipTone {
  if (status === 'active') return 'success';
  if (status === 'archived') return 'neutral';
  return 'warning';
}

type Props = { slug: string; organizationId: string };

/**
 * School admin › More › Committees (Garden). Same committees context, org
 * activity load, create flow and report operations as the Story screen.
 */
export function SchoolAdminCommitteesScreen({ slug, organizationId }: Props) {
  const router = useRouter();
  const bleed = useAdminTopBleed();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const action = useAdminAction(organizationId);
  const { reportError, toast } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const { committees, templates, pendingRequestCount, isLoading, error, hasLoaded, refresh } = useSchoolAdminCommittees();

  const [activeTab, setActiveTab] = useState<Tab>('committees');
  const [mountedTabs, setMountedTabs] = useState<Set<Tab>>(() => new Set(['committees']));
  const [rosterFilter, setRosterFilter] = useState<CommitteeRosterFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState<AdminSheetNotice | null>(null);
  const [activityItems, setActivityItems] = useState<CommitteeActivityItem[]>([]);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [joinRefreshKey, setJoinRefreshKey] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const activityMounted = mountedTabs.has('activity');

  useEffect(() => {
    if (hasLoaded && !isLoading) queueMicrotask(() => setLastUpdatedAt(Date.now()));
  }, [hasLoaded, isLoading]);

  const metrics = useMemo(() => deriveCommitteeRosterMetrics(committees, pendingRequestCount), [committees, pendingRequestCount]);
  const filtered = useMemo(() => filterCommitteesByRosterFilter(committees, rosterFilter), [committees, rosterFilter]);

  const changeTab = useCallback((tab: Tab) => {
    haptic.select();
    setActiveTab(tab);
    setMountedTabs((current) => (current.has(tab) ? current : new Set(current).add(tab)));
  }, []);

  const loadActivity = useCallback(async () => {
    try {
      setActivityItems(await fetchAdminCommitteeActivity(organizationId, slug, { limit: 12 }));
    } catch (activityError) {
      reportError('committees.activity.org_load', activityError);
      setActivityItems([]);
    } finally {
      setActivityLoaded(true);
    }
  }, [organizationId, reportError, slug]);

  useEffect(() => {
    if (activityMounted) void loadActivity();
  }, [activityMounted, loadActivity]);

  const refreshAll = useCallback(async () => {
    setJoinRefreshKey((key) => key + 1);
    await Promise.all([refresh(), activityMounted ? loadActivity() : Promise.resolve()]);
  }, [activityMounted, loadActivity, refresh]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh: refreshAll, error, label: 'Committees', id: 'admin-committees-refresh' });

  const openCommittee = useCallback(
    (committeeId: string, section?: string) => router.push(schoolAdminCommitteeWorkspaceRoute(slug, committeeId, section) as Href),
    [router, slug],
  );

  const openCreate = () => {
    if (readOnly) return notifyReadOnly();
    setCreateNotice(null);
    setCreateOpen(true);
  };

  const submitCreate = async (input: CreateCommitteeInput) => {
    if (readOnly) return setCreateNotice(READ_ONLY_NOTICE);
    setCreating(true);
    setCreateNotice(null);
    const created = { id: '' };
    let failure = '';
    const ok = await action.run(
      async () => {
        const committee = await createCommitteeFromTemplate(supabase, organizationId, { ...input, status: 'active' });
        created.id = committee.id;
      },
      {
        key: 'committee-create',
        silent: true,
        operation: 'committees.create',
        error: (err) => {
          failure = errorText(err, 'Failed to create committee.');
          return { title: "Couldn't create the committee" };
        },
      },
    );
    setCreating(false);
    if (!ok) {
      setCreateNotice({ tone: 'error', title: `${input.name} wasn't created`, description: `${failure} Nothing was saved.` });
      return;
    }
    void refresh({ silent: true });
    closeThen(
      () => setCreateOpen(false),
      () => {
        toast.success(`${input.name} created`, { id: 'committee-create', description: 'Its workspace is open. Invite members from the Members section.' });
        openCommittee(created.id, 'home');
      },
    );
  };

  const statusLine = [
    metrics.activeCount > 0 ? `${metrics.activeCount} active committee${metrics.activeCount === 1 ? '' : 's'}` : null,
    metrics.pendingJoinRequests > 0
      ? `${metrics.pendingJoinRequests} pending join request${metrics.pendingJoinRequests === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  if (isLoading && !hasLoaded) return <CommitteesSkeleton />;

  const refreshControl = <RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />;

  const listHeader = (
    <View style={styles.headerBlock}>
      {committees.length > 0 ? (
        <Animated.View entering={calmEnter({ delay: 40 })}>
          <AdminKpiTiles
            tiles={[
              { id: 'active', label: 'Active committees', value: String(metrics.activeCount), barColor: KPI_BARS.active, onPress: () => setRosterFilter('active') },
              { id: 'volunteers', label: 'Total volunteers', value: String(metrics.totalVolunteers), barColor: KPI_BARS.volunteers, onPress: () => setRosterFilter('all') },
              { id: 'pending', label: 'Pending join requests', value: String(metrics.pendingJoinRequests), barColor: KPI_BARS.pending, onPress: () => changeTab('join_requests') },
              { id: 'archived', label: 'Archived committees', value: String(metrics.archivedCount), barColor: KPI_BARS.archived, onPress: () => setRosterFilter('archived') },
            ]}
          />
        </Animated.View>
      ) : null}
      {metrics.pendingJoinRequests > 0 ? (
        <AdminLeadStrip
          testID="committees-review-requests"
          icon="person-add-outline"
          title={`${metrics.pendingJoinRequests} join request${metrics.pendingJoinRequests === 1 ? '' : 's'} waiting for review`}
          subtitle="Approve with an access level and duty role, or decline."
          pillLabel="Review requests"
          onPress={() => changeTab('join_requests')}
        />
      ) : null}
      {committees.length > 0 ? (
        <AdminFilterChips<CommitteeRosterFilter>
          accessibilityLabel="Filter committees"
          items={[
            { id: 'all', label: 'All', count: metrics.totalCount },
            { id: 'active', label: 'Active', count: metrics.activeCount },
            { id: 'archived', label: 'Archived', count: metrics.archivedCount },
          ]}
          activeId={rosterFilter}
          onChange={setRosterFilter}
        />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]}>
      <StatusBar style="dark" />
      <View style={styles.top}>
        <GBackHeader
          backLabel="More"
          backAccessibilityLabel="Back"
          onBack={() => router.back()}
          title="Committees"
          accentWord="Committees"
          subtitle={statusLine || 'Structured parent workspaces for volunteer groups, coordinators, and festival teams.'}
          aside={<AdminToolbarButton icon="add" label="Create" accessibilityLabel="Create committee" onPress={openCreate} />}
        />
        {lastUpdatedAt ? <UpdatedLine at={lastUpdatedAt} /> : null}
        {error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't refresh committees"
            description={error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void onPullRefresh()} />}
          />
        ) : null}
        <GSegmented<Tab>
          accessibilityLabel="Committee sections"
          compact
          items={[
            { id: 'committees', label: 'Committees', testID: 'school-admin-committees-nav' },
            { id: 'join_requests', label: 'Join requests', badge: pendingRequestCount, testID: 'school-admin-committees-join-requests-nav' },
            { id: 'activity', label: 'Activity', testID: 'school-admin-committees-activity-nav' },
          ]}
          activeId={activeTab}
          onChange={changeTab}
        />
      </View>

      <View style={styles.panels}>
        <View style={[styles.panel, activeTab !== 'committees' && styles.hidden]}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={Separator}
            ListHeaderComponent={listHeader}
            refreshControl={refreshControl}
            ListEmptyComponent={
              committees.length === 0 ? (
                <AdminEmptyPanel
                  icon="heart-outline"
                  title="No committees yet"
                  body="Create a committee workspace from a template to get started."
                  actionLabel="Create committee"
                  onAction={openCreate}
                />
              ) : (
                <AdminEmptyPanel icon="search-outline" title="No committees in this view." actionLabel="Show all" onAction={() => setRosterFilter('all')} />
              )
            }
            renderItem={({ item }) => <CommitteeRow committee={item} onPress={() => openCommittee(item.id, 'home')} />}
          />
        </View>

        {mountedTabs.has('join_requests') ? (
          <ScrollView style={[styles.panel, activeTab !== 'join_requests' && styles.hidden]} contentContainerStyle={styles.list} refreshControl={refreshControl}>
            <AdminJoinRequests
              organizationId={organizationId}
              schoolSlug={slug}
              refreshKey={joinRefreshKey}
              onChanged={() => void refresh({ silent: true })}
            />
          </ScrollView>
        ) : null}

        {activityMounted ? (
          <ScrollView style={[styles.panel, activeTab !== 'activity' && styles.hidden]} contentContainerStyle={styles.list} refreshControl={refreshControl}>
            <GCard title="Recent activity across committees">
              <AdminCommitteeActivity
                items={activityItems}
                loading={!activityLoaded}
                showCommitteeName
                onItemPress={(item) => item.committeeId && openCommittee(item.committeeId, 'activity')}
              />
            </GCard>
          </ScrollView>
        ) : null}
      </View>

      <AdminCreateCommitteeSheet
        visible={createOpen}
        templates={templates}
        saving={creating}
        notice={createNotice}
        onClose={() => setCreateOpen(false)}
        onSubmit={(input) => void submitCreate(input)}
      />
    </View>
  );
}

function UpdatedLine({ at }: { at: number }) {
  const label = useUpdatedLabel(at);
  return label ? <Text style={styles.updated}>{label}</Text> : null;
}

function CommitteeRow({ committee, onPress }: { committee: CommitteeListItem; onPress: () => void }) {
  return (
    <GPressable accessibilityLabel={`${committee.name}. ${committee.status}. ${committee.memberCount} members`} onPress={onPress} pressedScale={0.985} style={styles.card}>
      <AdminIconChip name="heart-outline" tint={committee.status === 'active' ? Garden.lav : Garden.paper} size={44} />
      <View style={styles.cardCopy}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {committee.name}
          </Text>
          <GChip label={committee.status} tone={statusTone(committee.status)} />
        </View>
        {committee.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {committee.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Ionicons name="people-outline" size={13} color={Garden.soft} />
          <Text style={styles.cardMetaText}>
            {committee.memberCount} member{committee.memberCount === 1 ? '' : 's'}
            {committee.termLabel ? ` · ${committee.termLabel}` : ''}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function CommitteesSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading committees" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skBack} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skTabs} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 10 },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, marginTop: -4 },
  panels: { flex: 1 },
  panel: { flex: 1 },
  hidden: { display: 'none' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 0 },
  headerBlock: { gap: 14, marginBottom: 14 },
  separator: { height: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  cardCopy: { flex: 1, minWidth: 0, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flexShrink: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink },
  cardDescription: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 80, height: 20, borderRadius: 10 },
  skTitle: { width: '60%', height: 32, borderRadius: 10 },
  skTabs: { height: 40, borderRadius: 20 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
  skRow: { height: 88, borderRadius: 18 },
});
