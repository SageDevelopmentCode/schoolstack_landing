import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentAttendanceHistoryDetailSheet } from '@/components/parent/attendance/parent-attendance-history-detail-sheet';
import { ParentAttendanceHistoryListItem } from '@/components/parent/attendance/parent-attendance-history-list-item';
import { ParentAttendanceSkeleton } from '@/components/parent/attendance/parent-attendance-skeleton';
import { ParentAttendanceStoryHeader } from '@/components/parent/attendance/parent-attendance-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { goBackOrReplace } from '@/lib/navigation';
import { childFirstName } from '@/lib/parent/parent-children-utils';
import { parentTabRoute } from '@/lib/parent/parent-nav';
import {
  fetchParentAttendanceEligibleChildren,
  fetchParentStudentAttendanceHistory,
  type ParentAttendanceEligibleChild,
} from '@/lib/parent/parent-portal-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const PAGE_SIZE = 20;

type StudentHistoryCache = {
  entries: AttendanceHistoryEntry[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
};

type ParentAttendanceScreenProps = {
  slug: string;
  organizationId: string;
};

export function ParentAttendanceScreen({ slug, organizationId }: ParentAttendanceScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();

  const [eligibleChildren, setEligibleChildren] = useState<ParentAttendanceEligibleChild[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenRefreshing, setChildrenRefreshing] = useState(false);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [hasLoadedChildren, setHasLoadedChildren] = useState(false);

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<string, StudentHistoryCache>>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AttendanceHistoryEntry | null>(null);

  const selectedChild = useMemo(
    () =>
      eligibleChildren.find((child) => child.applicationId === selectedApplicationId) ??
      eligibleChildren[0] ??
      null,
    [eligibleChildren, selectedApplicationId],
  );

  const selectedStudentId = selectedChild?.studentId ?? null;
  const cachedHistory = selectedStudentId ? historyCache[selectedStudentId] : undefined;
  const entries = cachedHistory?.entries ?? [];
  const totalCount = cachedHistory?.totalCount ?? 0;
  const hasMore = cachedHistory?.hasMore ?? false;
  const historyError = cachedHistory?.error ?? null;

  const handleBack = useCallback(() => {
    goBackOrReplace(router, parentTabRoute(slug, 'home'));
  }, [router, slug]);

  const updateHistoryCache = useCallback(
    (studentId: string, updater: (current: StudentHistoryCache | undefined) => StudentHistoryCache) => {
      setHistoryCache((current) => ({
        ...current,
        [studentId]: updater(current[studentId]),
      }));
    },
    [],
  );

  const loadEligibleChildren = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setChildrenRefreshing(true);
      } else {
        setChildrenLoading(true);
      }
      setChildrenError(null);

      try {
        const payload = await fetchParentAttendanceEligibleChildren(organizationId);
        setEligibleChildren(payload.eligibleChildren);
        setHasLoadedChildren(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load attendance children.';
        setChildrenError(message);
        void reportMobileOperationalError(
          {
            organizationId,
            surface: 'parent_portal',
            operation: 'attendance.load_eligible_children',
            error: message,
          },
          err,
        );
      } finally {
        setChildrenLoading(false);
        setChildrenRefreshing(false);
      }
    },
    [organizationId],
  );

  const loadHistory = useCallback(
    async (studentId: string, offset: number, append: boolean) => {
      if (append) {
        setHistoryLoadingMore(true);
      } else {
        setHistoryLoading(true);
      }

      if (!append) {
        updateHistoryCache(studentId, (current) => ({
          entries: current?.entries ?? [],
          totalCount: current?.totalCount ?? 0,
          hasMore: current?.hasMore ?? false,
          error: null,
        }));
      }

      try {
        const payload = await fetchParentStudentAttendanceHistory(organizationId, studentId, {
          limit: PAGE_SIZE,
          offset,
        });
        const nextEntries = payload.entries ?? [];
        updateHistoryCache(studentId, (current) => {
          const previousEntries = current?.entries ?? [];
          return {
            entries: append ? [...previousEntries, ...nextEntries] : nextEntries,
            totalCount: payload.totalCount ?? 0,
            hasMore: payload.hasMore ?? false,
            error: null,
          };
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load attendance history.';
        updateHistoryCache(studentId, (current) => ({
          entries: append ? (current?.entries ?? []) : [],
          totalCount: append ? (current?.totalCount ?? 0) : 0,
          hasMore: append ? (current?.hasMore ?? false) : false,
          error: message,
        }));
        void reportMobileOperationalError(
          {
            organizationId,
            surface: 'parent_portal',
            operation: 'attendance.load_history',
            error: message,
            entityType: 'student',
            entityId: studentId,
          },
          err,
        );
      } finally {
        setHistoryLoading(false);
        setHistoryLoadingMore(false);
      }
    },
    [organizationId, updateHistoryCache],
  );

  useEffect(() => {
    void loadEligibleChildren();
  }, [loadEligibleChildren]);

  useEffect(() => {
    if (eligibleChildren.length === 0) {
      setSelectedApplicationId(null);
      return;
    }

    if (
      !selectedApplicationId ||
      !eligibleChildren.some((child) => child.applicationId === selectedApplicationId)
    ) {
      setSelectedApplicationId(eligibleChildren[0].applicationId);
    }
  }, [eligibleChildren, selectedApplicationId]);

  useEffect(() => {
    if (!selectedStudentId) return;
    setSelectedEntry(null);
    if (historyCache[selectedStudentId]) return;
    void loadHistory(selectedStudentId, 0, false);
    // Only re-run when the selected child changes; cache updates should not refetch or reset UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- historyCache read on student switch only
  }, [loadHistory, selectedStudentId]);

  const handleRefresh = useCallback(async () => {
    await loadEligibleChildren(true);
    if (!selectedStudentId) return;

    setHistoryCache((current) => {
      const next = { ...current };
      delete next[selectedStudentId];
      return next;
    });
    await loadHistory(selectedStudentId, 0, false);
  }, [loadEligibleChildren, loadHistory, selectedStudentId]);

  const handleLoadMore = useCallback(() => {
    if (!selectedStudentId || historyLoadingMore || !hasMore) return;
    void loadHistory(selectedStudentId, entries.length, true);
  }, [entries.length, hasMore, historyLoadingMore, loadHistory, selectedStudentId]);

  if (childrenLoading && !hasLoadedChildren) {
    return (
      <View style={[styles.screen, { backgroundColor: Story.paper, paddingHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
        </Pressable>
        <ParentAttendanceSkeleton />
      </View>
    );
  }

  const firstName = selectedChild ? childFirstName(selectedChild.studentName) : '';
  const showHistorySkeleton = historyLoading && !cachedHistory;

  return (
    <>
      <ScrollView
        style={{ backgroundColor: Story.paper }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={childrenRefreshing} onRefresh={() => void handleRefresh()} />
        }>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
        </Pressable>

        <ParentAttendanceStoryHeader
          eligibleChildren={eligibleChildren}
          selectedApplicationId={selectedChild?.applicationId ?? ''}
          onSelectChild={setSelectedApplicationId}
        />

        {childrenError ? <StoryErrorBanner message={childrenError} /> : null}

        {eligibleChildren.length === 0 ? (
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No enrolled learners with attendance tracking yet.
            </Text>
          </StoryCard>
        ) : (
          <View style={styles.historySection}>
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, { color: theme.ink }]}>
                {firstName}&apos;s history
              </Text>
              {totalCount > 0 ? (
                <Text style={[styles.panelMeta, { color: theme.muted }]}>
                  {entries.length} of {totalCount}
                </Text>
              ) : null}
            </View>

            {historyError ? (
              <StoryErrorBanner message={historyError} />
            ) : showHistorySkeleton ? (
              <ParentAttendanceSkeleton rowCount={6} rowsOnly />
            ) : entries.length === 0 ? (
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                No attendance records yet.
              </Text>
            ) : (
              <View>
                {entries.map((entry) => (
                  <ParentAttendanceHistoryListItem
                    key={entry.date}
                    entry={entry}
                    onPress={setSelectedEntry}
                  />
                ))}
                {historyLoadingMore ? (
                  <ParentAttendanceSkeleton rowCount={3} rowsOnly />
                ) : null}
              </View>
            )}

            {hasMore ? (
              <View style={styles.loadMoreWrap}>
                <StoryButton
                  label={historyLoadingMore ? 'Loading…' : 'Load more'}
                  variant="outline"
                  previewSafe
                  disabled={historyLoadingMore}
                  onPress={handleLoadMore}
                />
                {historyLoadingMore ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <ParentAttendanceHistoryDetailSheet
        visible={selectedEntry !== null}
        entry={selectedEntry}
        studentName={selectedChild?.studentName ?? ''}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
    paddingTop: Spacing.two,
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
    fontWeight: '500',
  },
  emptyCard: {
    marginTop: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  historySection: {
    gap: Spacing.two,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  panelTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '700',
  },
  panelMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
  },
  loadMoreWrap: {
    marginTop: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
});
