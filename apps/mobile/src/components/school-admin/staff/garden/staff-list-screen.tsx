import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import {
  AdminEmptyPanel,
  AdminFilterChips,
  AdminKpiTiles,
  AdminLeadStrip,
  AdminSearchField,
  AdminToolbarButton,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import { AdminStaffFormSheet } from '@/components/school-admin/staff/garden/admin-staff-form-sheet';
import { StaffRow } from '@/components/school-admin/staff/garden/staff-row';
import {
  useStaffListController,
  type StaffListController,
  type StaffListFilter,
} from '@/components/school-admin/staff/garden/use-staff-list-controller';
import { useStaffListFeedback } from '@/components/school-admin/staff/garden/use-staff-list-feedback';
import { calmEnter } from '@/lib/motion/portal-motion';

const KPI_BARS = { all: '#2E4A3C', active: '#7FA7D9', portal: '#E2B33C', learners: '#B5577A' } as const;

/** "12 team members · 2 profiles need review" — built only from data. */
export function staffStatusLine(total: number, needsReview: number): string {
  if (total === 0) return 'No staff on your roster yet';
  const parts = [`${total} team member${total === 1 ? '' : 's'}`];
  parts.push(needsReview > 0 ? `${needsReview} profile${needsReview === 1 ? ' needs' : 's need'} review` : 'every profile is complete');
  return parts.join(' · ');
}

const TEMP_FILTER_LABELS: Partial<Record<StaffListFilter, string>> = { active: 'Active', with_learners: 'With learners' };

type StaffListScreenProps = { slug: string; organizationId: string };

/**
 * School admin › More › Staff (Garden). Data in `useStaffListController`;
 * feedback adds toasts, the in-sheet Add staff status and filter haptics.
 */
export function StaffListScreen(props: StaffListScreenProps) {
  const controller = useStaffListController(props);
  if (controller.status === 'loading') return <StaffListSkeleton />;
  if (controller.status === 'error') return <StaffListError controller={controller} />;
  return <StaffListContent controller={controller} />;
}

function StaffListContent({ controller }: { controller: StaffListController }) {
  const feedback = useStaffListFeedback(controller);
  const bleed = useAdminTopBleed();
  const { metrics, staffMembers, rosterFilter, searchQuery } = controller;
  const hasStaff = staffMembers.length > 0;

  const chips = useMemo<AdminFilterChip<StaffListFilter>[]>(() => {
    const items: AdminFilterChip<StaffListFilter>[] = [
      { id: 'all', label: 'All', count: metrics.totalCount },
      { id: 'teachers', label: 'Teachers', count: metrics.teacherCount },
      { id: 'portal_active', label: 'Portal active', count: metrics.portalActiveCount },
      { id: 'review', label: 'Review', count: metrics.needsReviewCount },
    ];
    const temp = TEMP_FILTER_LABELS[rosterFilter];
    if (temp) {
      items.splice(1, 0, {
        id: rosterFilter,
        label: temp,
        count: rosterFilter === 'active' ? metrics.activeCount : metrics.withLearnersCount,
      });
    }
    return items;
  }, [metrics, rosterFilter]);

  const filtering = rosterFilter !== 'all' || searchQuery.trim().length > 0;

  const header = (
    <View style={styles.headerBlock}>
      {hasStaff ? (
        <Animated.View entering={calmEnter({ delay: 40 })}>
          <AdminKpiTiles
            tiles={[
              { id: 'all', label: 'All staff', value: String(metrics.totalCount), barColor: KPI_BARS.all, onPress: () => feedback.applyFilter('all'), testID: 'staff-kpi-all' },
              { id: 'active', label: 'Active', value: String(metrics.activeCount), barColor: KPI_BARS.active, onPress: () => feedback.applyFilter('active'), testID: 'staff-kpi-active' },
              { id: 'portal', label: 'Portal active', value: String(metrics.portalActiveCount), barColor: KPI_BARS.portal, onPress: () => feedback.applyFilter('portal_active'), testID: 'staff-kpi-portal' },
              { id: 'learners', label: 'With learners', value: String(metrics.withLearnersCount), barColor: KPI_BARS.learners, onPress: () => feedback.applyFilter('with_learners'), testID: 'staff-kpi-learners' },
            ]}
          />
        </Animated.View>
      ) : null}

      {metrics.needsReviewCount > 0 && rosterFilter !== 'review' ? (
        <Animated.View entering={calmEnter({ delay: 90 })}>
          <AdminLeadStrip
            testID="staff-show-review"
            icon="id-card-outline"
            title={`${metrics.needsReviewCount} staff profile${metrics.needsReviewCount === 1 ? ' needs' : 's need'} review`}
            subtitle="They're missing an email or a job title. Open one and tap Edit profile to fill it in."
            pillLabel="Show profiles to review"
            onPress={() => feedback.applyFilter('review')}
          />
        </Animated.View>
      ) : null}

      <AdminSearchField value={searchQuery} onChangeText={controller.setSearchQuery} placeholder="Search staff" accessibilityLabel="Search staff" />

      {hasStaff ? (
        <AdminFilterChips accessibilityLabel="Filter staff" items={chips} activeId={rosterFilter} onChange={feedback.applyFilter} />
      ) : null}

      {controller.error ? (
        <GInlineBanner
          tone="error"
          title="Couldn't refresh staff"
          description={`${controller.error} Showing what we already have.`}
          action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
        />
      ) : null}

      {filtering && controller.filteredStaff.length > 0 ? (
        <Text style={styles.resultCount} accessibilityLiveRegion="polite">
          Showing {controller.filteredStaff.length} of {metrics.totalCount}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-staff-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Staff"
          accentWord="Staff"
          statusLine={staffStatusLine(metrics.totalCount, metrics.needsReviewCount)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="staff-status-line"
          toolbar={
            <AdminToolbarButton icon="person-add" label="Add" accessibilityLabel="Add staff" onPress={feedback.openAdd} testID="staff-add" />
          }
        />
      </View>
      <FlatList
        data={controller.filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }
        ListEmptyComponent={
          !hasStaff ? (
            <AdminEmptyPanel
              icon="people-outline"
              title="No staff yet."
              body="Add your first team member to give them portal access."
              actionLabel="Add staff"
              onAction={feedback.openAdd}
            />
          ) : rosterFilter === 'review' && !searchQuery.trim() ? (
            <AdminEmptyPanel
              tone="mint"
              icon="checkmark-circle"
              title="No staff profiles need review right now."
              actionLabel="Show everyone"
              onAction={controller.clearFilters}
            />
          ) : (
            <AdminEmptyPanel icon="search-outline" title="No staff match your search." actionLabel="Show everyone" onAction={controller.clearFilters} />
          )
        }
        renderItem={({ item }) => <StaffRow member={item} onPress={controller.openMember} />}
      />

      <AdminStaffFormSheet
        visible={controller.addSheetOpen}
        saving={controller.creating}
        notice={feedback.addNotice}
        onClose={feedback.closeAdd}
        onSubmit={(input) => void feedback.submitAdd(input)}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function StaffListError({ controller }: { controller: StaffListController }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <AdminTabHeader title="Staff" accentWord="Staff" />
      <GErrorCard
        title="We couldn't load your staff"
        message={controller.error ?? 'Failed to load staff.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function StaffListSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading staff" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skSearch} />
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
  headerBlock: { gap: 14, marginBottom: 14 },
  separator: { height: 10 },
  resultCount: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  errorWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '40%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '75%', height: 16, borderRadius: 8 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
  skSearch: { height: 48, borderRadius: 24 },
  skRow: { height: 80, borderRadius: 18 },
});
