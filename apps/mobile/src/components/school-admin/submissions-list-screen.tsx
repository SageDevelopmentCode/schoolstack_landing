import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdmissionsMetricRow } from '@/components/school-admin/admissions/admissions-metric-row';
import { AdmissionsNeedsAttentionBanner } from '@/components/school-admin/admissions/admissions-needs-attention-banner';
import { AdmissionsStoryHeader } from '@/components/school-admin/admissions/admissions-story-header';
import { SubmissionStoryListItem } from '@/components/school-admin/admissions/submission-story-list-item';
import { SubmissionStatusFilters } from '@/components/school-admin/submission-status-filters';
import { SubmissionsListSkeleton } from '@/components/school-admin/submissions-list-skeleton';
import { StoryCard } from '@/components/story/story-card';
import { useSchoolAdminSubmissions } from '@/contexts/school-admin-submissions-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from '@/lib/admissions/application-status-ui';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SubmissionsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function SubmissionsListScreen({ organizationId: _organizationId, slug }: SubmissionsListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const {
    submissions,
    meta,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useSchoolAdminSubmissions();
  const [statusFilter, setStatusFilter] = useState('all');

  const statusCounts = meta?.statusCounts ?? {};
  const activeSubmissionsCount = meta?.activeSubmissionsCount ?? 0;
  const draftCount = statusCounts.draft ?? 0;
  const submittedCount = statusCounts.submitted ?? 0;
  const enrolledCount = statusCounts.enrolled ?? 0;
  const latestSubmitted = meta?.latestSubmitted ?? null;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (statusFilter === 'all') {
        return !APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
          (excluded) => excluded === submission.status,
        );
      }
      return submission.status === statusFilter;
    });
  }, [statusFilter, submissions]);

  const hasAnyApplications = activeSubmissionsCount + (statusCounts.withdrawn ?? 0) > 0;
  const showEmptyFilteredState =
    filteredSubmissions.length === 0 && hasAnyApplications && statusFilter !== 'all';

  const handlePressSubmission = (submission: AdminApplicationSubmission) => {
    router.push(`/school-admin/${slug}/admissions/submissions/${submission.id}`);
  };

  const handleReviewLatestSubmitted = () => {
    if (!latestSubmitted) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${latestSubmitted.id}`);
  };

  const handleRefresh = () => {
    void refresh({ silent: true });
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <AdmissionsStoryHeader activeCount={activeSubmissionsCount} />
      </Animated.View>

      {hasAnyApplications ? (
        <Animated.View entering={FadeInDown.delay(40).duration(350)}>
          <AdmissionsMetricRow
            activeCount={activeSubmissionsCount}
            draftCount={draftCount}
            submittedCount={submittedCount}
            enrolledCount={enrolledCount}
          />
        </Animated.View>
      ) : null}

      {latestSubmitted ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <AdmissionsNeedsAttentionBanner
            latestSubmitted={latestSubmitted}
            onReview={handleReviewLatestSubmitted}
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(120).duration(350)}>
        <SubmissionStatusFilters
          activeStatus={statusFilter}
          counts={statusCounts}
          onChange={setStatusFilter}
        />
      </Animated.View>
    </View>
  );

  if (isLoading && submissions.length === 0) {
    return <SubmissionsListSkeleton />;
  }

  if (error && submissions.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerSpinner}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {showEmptyFilteredState
                ? 'No submissions match the current filters.'
                : 'No applications yet. Publish an enrollment flow and share your public apply link with families.'}
            </Text>
          </StoryCard>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(160 + index * 30).duration(300)}>
            <SubmissionStoryListItem submission={item} onPress={handlePressSubmission} />
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  separator: {
    height: Spacing.three,
  },
  footerSpinner: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,

    paddingVertical: Spacing.four,
  },
  emptyCard: {
    padding: StoryCardPadding,
    marginTop: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
});
