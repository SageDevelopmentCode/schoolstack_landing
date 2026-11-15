import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, PORTAL_EASE, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GHand, GIcon, GPressable, GSkeleton, gText } from '@/components/parent/garden/ui';
import { buildUnreadMaps } from '@/lib/committees/committee-unread-section-labels';
import {
  getCommitteesExploreRoute,
  getCommitteesWorkspaceRoute,
  type CommitteesContextValue,
  type CommitteesPortal,
} from '@/lib/committees/committees-portal-config';
import { useCommitteeUnreadSummary } from '@/lib/committees/use-committee-unread-summary';
import {
  REQUEST_STATUS_CHIP,
  committeesSubtitle,
  committeesTitle,
  formatUnreadBadge,
  pluralize,
  unreadLabel,
} from '@/lib/parent/parent-committees-garden';
import type {
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
  ParentCommitteesTab,
} from '@/lib/parent/parent-committees-types';

type ListItem =
  | { kind: 'browse'; committee: ParentCommitteeBrowseItem }
  | { kind: 'mine'; committee: ParentCommitteeListItem };

function MineCard({
  committee,
  unreadCount,
  sectionLabels,
  onPress,
}: {
  committee: ParentCommitteeListItem;
  unreadCount: number;
  sectionLabels?: string[];
  onPress: () => void;
}) {
  const accent = useGardenAccent();
  const sections = sectionLabels?.length ? sectionLabels.join(' · ') : null;
  return (
    <GPressable
      accessibilityLabel={`${committee.name}${unreadCount ? `, ${unreadLabel(unreadCount)}` : ''}. Open workspace`}
      pressedScale={0.98}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.cardHead}>
        <GIcon name="people-outline" size="md" bg={Garden.mint} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {committee.name}
          </Text>
          <GChip label={committee.termLabel} tone="info" />
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </View>
      {unreadCount > 0 ? (
        <View
          style={[styles.unread, { backgroundColor: Garden.butter }]}
          accessibilityLabel={`${unreadLabel(unreadCount)}${sections ? `: ${sections}` : ''}`}>
          <Ionicons name="notifications" size={16} color="#6B4F00" />
          <View style={styles.flex}>
            <Text style={styles.unreadTitle}>{unreadLabel(unreadCount)}</Text>
            {sections ? <Text style={styles.unreadMeta}>{sections}</Text> : null}
          </View>
          <View style={[styles.badge, { backgroundColor: accent.clay }]}>
            <Text style={styles.badgeText}>{formatUnreadBadge(unreadCount)}</Text>
          </View>
        </View>
      ) : null}
      {committee.description ? (
        <Text style={gText.meta} numberOfLines={2}>
          {committee.description}
        </Text>
      ) : null}
      {committee.openTaskCount > 0 || committee.nextEventTitle ? (
        <View style={styles.metaRow}>
          {committee.openTaskCount > 0 ? (
            <View style={styles.metaItem}>
              <Ionicons name="checkbox-outline" size={14} color={Garden.soft} />
              <Text style={styles.metaText}>{pluralize(committee.openTaskCount, 'open task')}</Text>
            </View>
          ) : null}
          {committee.nextEventTitle ? (
            <View style={[styles.metaItem, styles.flexShrink]}>
              <Ionicons name="calendar-outline" size={14} color={Garden.soft} />
              <Text style={styles.metaText} numberOfLines={1}>
                Next: {committee.nextEventTitle}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </GPressable>
  );
}

function BrowseCard({ committee, onPress }: { committee: ParentCommitteeBrowseItem; onPress: () => void }) {
  const request = committee.requestStatus && !committee.isMember ? REQUEST_STATUS_CHIP[committee.requestStatus] : null;
  return (
    <GPressable
      accessibilityLabel={`${committee.name}${committee.isMember ? ', Member' : request ? `, ${request.label}` : ''}. ${committee.isMember ? 'Open workspace' : 'View details'}`}
      pressedScale={0.98}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.cardHead}>
        <GIcon name="heart-outline" size="md" bg={Garden.lav} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {committee.name}
          </Text>
          <GChip label={committee.termLabel} tone="info" />
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </View>
      {committee.description ? (
        <Text style={gText.meta} numberOfLines={3}>
          {committee.description}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        {committee.isMember ? <GChip label="Member" tone="success" icon="checkmark" /> : null}
        {request ? <GChip label={request.label} tone={request.tone} /> : null}
        {committee.dutyRoles.length > 0 ? (
          <Text style={styles.metaText}>{pluralize(committee.dutyRoles.length, 'role')}</Text>
        ) : null}
      </View>
    </GPressable>
  );
}

function EmptyState({ tab }: { tab: ParentCommitteesTab }) {
  const explore = tab === 'explore';
  return (
    <GCard kicker="Committees" title={explore ? 'No committees available' : 'No committees yet'}>
      <Text style={gText.body}>
        {explore
          ? 'When the school opens volunteer committees, they will appear here for you to explore.'
          : 'After the school approves your join request, your committee workspace will appear here.'}
      </Text>
      <View style={styles.hand}>
        <GHand>{explore ? 'Check back soon.' : 'Try the Explore tab.'}</GHand>
      </View>
    </GCard>
  );
}

function ListSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading committees" accessibilityState={{ busy: true }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHead}>
            <GSkeleton style={{ width: 44, height: 44, borderRadius: 22 }} />
            <View style={[styles.flex, { gap: 8 }]}>
              <GSkeleton style={{ width: '70%', height: 18 }} />
              <GSkeleton style={{ width: 90, height: 18, borderRadius: 999 }} />
            </View>
          </View>
          <GSkeleton style={{ width: '90%', height: 12 }} />
        </View>
      ))}
    </View>
  );
}

/** Committees list (My committees / Explore) in Garden. Shared by parent and teacher portals. */
export function CommitteesGardenScreen({
  slug,
  organizationId,
  portal,
  useCommittees,
}: {
  slug: string;
  organizationId: string;
  portal: CommitteesPortal;
  useCommittees: () => CommitteesContextValue;
}) {
  const router = useRouter();
  const accent = useGardenAccent();
  const { summary, refreshUnreadSummary } = useCommitteeUnreadSummary(portal, organizationId);
  const { unreadByCommitteeId, unreadSectionLabelsByCommitteeId } = useMemo(
    () => buildUnreadMaps(summary),
    [summary],
  );
  const { browseCommittees, myCommittees, isLoading, isRefreshing, error, hasLoaded, ensureLoaded, refresh } =
    useCommittees();
  const [activeTab, setActiveTab] = useState<ParentCommitteesTab>('mine');

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), refreshUnreadSummary()]);
  }, [refresh, refreshUnreadSummary]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: refreshAll,
    error,
    label: 'Committees',
    id: 'committees-refresh',
  });

  const listItems = useMemo(
    (): ListItem[] =>
      activeTab === 'explore'
        ? browseCommittees.map((committee) => ({ kind: 'browse', committee }))
        : myCommittees.map((committee) => ({ kind: 'mine', committee })),
    [activeTab, browseCommittees, myCommittees],
  );

  const openWorkspace = useCallback(
    (id: string) => router.push(getCommitteesWorkspaceRoute(slug, portal, id)),
    [portal, router, slug],
  );
  const openExplore = useCallback(
    (id: string) => router.push(getCommitteesExploreRoute(slug, portal, id)),
    [portal, router, slug],
  );

  const totalUnread = myCommittees.reduce((sum, c) => sum + (unreadByCommitteeId[c.id] ?? 0), 0);

  const header = (
    <View style={styles.header} testID="parent-committees-story-header">
      <GBackHeader
        backLabel="More"
        backAccessibilityLabel="Back"
        onBack={() => router.back()}
        kicker="Volunteer & committees"
        title={committeesTitle(activeTab)}
        accentWord={activeTab === 'explore' ? 'Explore' : 'committees'}
        subtitle={committeesSubtitle(activeTab, browseCommittees.length, myCommittees.length)}
      />
      <GSegmented
        accessibilityLabel="Committee sections"
        items={[
          {
            id: 'mine' as const,
            label: 'My committees',
            icon: 'people-outline' as const,
            badge: totalUnread || undefined,
            testID: 'parent-committees-mine-nav',
          },
          { id: 'explore' as const, label: 'Explore', icon: 'compass-outline' as const, testID: 'parent-committees-explore-nav' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />
      {error && hasLoaded ? (
        <GErrorCard
          kicker="Committees"
          title="Some committees may be out of date"
          message={`${error} Pull down or try again.`}
          onRetry={() => void onPullRefresh()}
        />
      ) : null}
    </View>
  );

  if (isLoading && !hasLoaded) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          {header}
          <ListSkeleton />
        </View>
      </View>
    );
  }

  if (error && !hasLoaded) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <GErrorCard
            kicker="Committees"
            title="We couldn't load committees"
            message={`${error} Check your connection, then try again.`}
            onRetry={() => void refreshAll()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root} testID="parent-committees-screen">
      <StatusBar style="dark" />
      <FlatList
        data={listItems}
        keyExtractor={(item) => `${item.kind}-${item.committee.id}`}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.headerSpacing}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
        ListEmptyComponent={isLoading ? null : <EmptyState tab={activeTab} />}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(40 + Math.min(index, 6) * 50)
              .duration(320)
              .easing(PORTAL_EASE)}>
            {item.kind === 'browse' ? (
              <BrowseCard
                committee={item.committee}
                onPress={() =>
                  item.committee.isMember ? openWorkspace(item.committee.id) : openExplore(item.committee.id)
                }
              />
            ) : (
              <MineCard
                committee={item.committee}
                unreadCount={unreadByCommitteeId[item.committee.id] ?? 0}
                sectionLabels={unreadSectionLabelsByCommitteeId[item.committee.id]}
                onPress={() => openWorkspace(item.committee.id)}
              />
            )}
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, flexGrow: 1 },
  header: { gap: 16 },
  headerSpacing: { marginBottom: 16 },
  skeleton: { gap: 12, marginTop: 16 },
  separator: { height: 12 },
  flex: { flex: 1, gap: 6 },
  flexShrink: { flexShrink: 1 },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontFamily: GardenFonts.display, fontSize: 19, lineHeight: 23, letterSpacing: -0.4, color: Garden.ink },
  unread: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  unreadTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: '#4D3900' },
  unreadMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: '#6B4F00' },
  badge: { minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: GardenFonts.bodyExtra, fontSize: 12, color: Garden.white },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  hand: { marginTop: 10 },
});
