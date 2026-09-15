import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StaffFormSheet } from '@/components/school-admin/staff/staff-form-sheet';
import { StaffListSkeleton } from '@/components/school-admin/staff/staff-list-skeleton';
import { StaffMetricRow } from '@/components/school-admin/staff/staff-metric-row';
import { StaffNeedsAttentionBanner } from '@/components/school-admin/staff/staff-needs-attention-banner';
import { StaffRosterFilters } from '@/components/school-admin/staff/staff-roster-filters';
import { StaffStoryHeader } from '@/components/school-admin/staff/staff-story-header';
import { StaffStoryListItem } from '@/components/school-admin/staff/staff-story-list-item';
import { StoryButton } from '@/components/story/story-button';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  deriveStaffRosterMetrics,
  filterStaffByRosterFilter,
  matchesStaffSearch,
  type StaffRosterFilter,
} from '@/lib/school-admin/admin-staff-roster-metrics';
import { fetchStaffMembers, type StaffMemberRecord } from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type StaffListScreenProps = {
  slug: string;
};

export function StaffListScreen({ slug }: StaffListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter();

  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<StaffRosterFilter>('all');
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const loadStaff = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const members = await fetchStaffMembers(slug);
        setStaffMembers(members);
      } catch (loadError) {
        reportError('school_admin_staff_list_load', loadError);
        setError(formatStaffApiError(loadError, 'Failed to load staff.'));
        setStaffMembers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [reportError, slug],
  );

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const metrics = useMemo(() => deriveStaffRosterMetrics(staffMembers), [staffMembers]);

  const filteredStaff = useMemo(() => {
    const byFilter = filterStaffByRosterFilter(staffMembers, rosterFilter);
    return byFilter.filter((member) => matchesStaffSearch(member, searchQuery));
  }, [rosterFilter, searchQuery, staffMembers]);

  const handlePressMember = (member: StaffMemberRecord) => {
    router.push(`/school-admin/${slug}/more/staff/${member.id}`);
  };

  const handleCreated = (staffMemberId: string) => {
    void loadStaff({ silent: true });
    router.push(`/school-admin/${slug}/more/staff/${staffMemberId}`);
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <StaffStoryHeader totalCount={metrics.totalCount} />
      </Animated.View>

      {staffMembers.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(40).duration(350)}>
          <StaffMetricRow
            totalCount={metrics.totalCount}
            activeCount={metrics.activeCount}
            portalActiveCount={metrics.portalActiveCount}
            withLearnersCount={metrics.withLearnersCount}
          />
        </Animated.View>
      ) : null}

      {metrics.needsReviewCount > 0 ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <StaffNeedsAttentionBanner
            needsReviewCount={metrics.needsReviewCount}
            onShowReview={() => setRosterFilter('review')}
          />
        </Animated.View>
      ) : null}

      {staffMembers.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <StaffRosterFilters
            activeFilter={rosterFilter}
            totalCount={metrics.totalCount}
            teacherCount={metrics.teacherCount}
            portalActiveCount={metrics.portalActiveCount}
            needsReviewCount={metrics.needsReviewCount}
            onChange={setRosterFilter}
          />
        </Animated.View>
      ) : null}

      <StoryButton label="Add staff" onPress={() => setAddSheetOpen(true)} />

      <View style={[styles.searchField, { backgroundColor: theme.white, borderColor: Story.line }]}>
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          accessibilityLabel="Search staff"
          placeholder="Search staff"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? <StoryErrorBanner message={error} /> : null}
    </View>
  );

  if (loading && staffMembers.length === 0) {
    return <StaffListSkeleton />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadStaff({ silent: true });
            }}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {staffMembers.length === 0
                ? 'No staff yet. Add your first team member to give them portal access.'
                : rosterFilter === 'review'
                  ? 'No staff profiles need review right now.'
                  : 'No staff match your search.'}
            </Text>
            {staffMembers.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setAddSheetOpen(true)}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={[styles.emptyLink, { color: theme.primary }]}>Add staff →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
            <StaffStoryListItem member={item} onPress={handlePressMember} />
          </Animated.View>
        )}
      />

      <StaffFormSheet
        visible={addSheetOpen}
        slug={slug}
        onClose={() => setAddSheetOpen(false)}
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
  headerBlock: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: StoryFonts.body,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
});
