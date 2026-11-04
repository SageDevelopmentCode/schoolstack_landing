import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { MY_HOURS_CARD_BODY_PADDING } from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { TEACHER_FLOATING_TAB_BAR_HEIGHT } from '@/components/teacher/teacher-floating-tab-bar';
import { TeacherMyHoursDayPanel } from '@/components/teacher/my-hours/teacher-my-hours-day-panel';
import { TeacherMyHoursMonthPanel } from '@/components/teacher/my-hours/teacher-my-hours-month-panel';
import { TeacherMyHoursSkeleton } from '@/components/teacher/my-hours/teacher-my-hours-skeleton';
import { TeacherMyHoursViewNav } from '@/components/teacher/my-hours/teacher-my-hours-story-header';
import { TeacherMyHoursSummaryCards } from '@/components/teacher/my-hours/teacher-my-hours-summary-cards';
import { TeacherMyHoursWeekPanel } from '@/components/teacher/my-hours/teacher-my-hours-week-panel';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { goBackOrReplace } from '@/lib/navigation';
import { isPreviewSessionActive } from '@/lib/platform-admin/preview-session-store';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  addDays,
  formatCompactNavDate,
  formatHoursMinutes,
  formatMonthYear,
  formatWallClockTime,
  isSameDay,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import {
  getDayLogForDateKey,
  referenceDateFromKey,
} from '@/lib/teacher/my-hours/my-hours-page-utils';
import {
  fetchTeacherMyHoursPageData,
  postTeacherMyHoursClockIn,
  postTeacherMyHoursClockOut,
} from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type {
  ClockActionPending,
  MyHoursView,
  TeacherMyHoursPageData,
} from '@/lib/teacher/my-hours/types';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { teacherTabRoute } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { Story, StoryFonts } from '@/constants/story-theme';

const MY_HOURS_HORIZONTAL_PADDING = Spacing.four;

type TeacherMyHoursScreenProps = {
  organizationId: string;
  slug: string;
};

export function TeacherMyHoursScreen({ organizationId, slug }: TeacherMyHoursScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const previewReadOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { data: homeData, ensureLoaded: ensureHomeLoaded } = useTeacherHome();

  const [pageData, setPageData] = useState<TeacherMyHoursPageData | null>(null);
  const [view, setView] = useState<MyHoursView>('day');
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void ensureHomeLoaded();
  }, [ensureHomeLoaded]);

  const myHoursEnabled = isTeacherFeatureEnabled(homeData?.features, 'my_hours');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const next = await fetchTeacherMyHoursPageData(organizationId, slug);
        setPageData(next);
        const ref = referenceDateFromKey(next.referenceDateKey);
        setFocusDate(ref);
        setMonthDate(new Date(ref.getFullYear(), ref.getMonth(), 1));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load My Hours.';
        setError(message);
        void reportError('my_hours.load', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, slug, reportError],
  );

  useEffect(() => {
    if (!myHoursEnabled && homeData) {
      setLoading(false);
      return;
    }
    if (myHoursEnabled || !homeData) {
      void load('initial');
    }
  }, [homeData, load, myHoursEnabled]);

  const referenceDate = useMemo(
    () => (pageData ? referenceDateFromKey(pageData.referenceDateKey) : new Date()),
    [pageData],
  );

  const activeSessionStartedAt = useMemo(() => {
    if (!pageData?.activeSession) return null;
    return new Date(pageData.activeSession.clockInAt);
  }, [pageData?.activeSession]);

  const elapsedSeconds = useLiveElapsed(activeSessionStartedAt);

  const focusDateKey = toDateKey(focusDate);

  const dayLog = useMemo(
    () =>
      pageData ? getDayLogForDateKey(pageData.entriesByDateKey, focusDate) : null,
    [pageData, focusDate],
  );

  const closedSessionsForFocusDay = useMemo(() => {
    if (!pageData) return [];
    const sessions = pageData.sessionsByDateKey[focusDateKey] ?? [];
    return sessions.filter((session) => session.clockOutAt != null);
  }, [pageData, focusDateKey]);

  const activeOnFocusDay =
    pageData?.activeSession != null &&
    pageData.activeSession.workDate === focusDateKey
      ? activeSessionStartedAt
      : null;

  const sidebarTodayMinutes = useMemo(() => {
    if (!pageData) return null;
    const todayKey = pageData.referenceDateKey;
    const closed = (pageData.sessionsByDateKey[todayKey] ?? []).filter(
      (session) => session.clockOutAt != null,
    );
    const completed = closed.reduce((sum, s) => sum + s.minutes, 0);
    const active =
      pageData.activeSession?.workDate === todayKey
        ? Math.floor(elapsedSeconds / 60)
        : 0;
    const total = completed + active;
    return total > 0 || pageData.activeSession ? total : pageData.sidebar.todayMinutes;
  }, [pageData, elapsedSeconds]);

  const handleClockIn = useCallback(async () => {
    if (previewReadOnly || activeSessionStartedAt || clockActionPending) return;
    setClockActionPending('in');
    try {
      const next = await postTeacherMyHoursClockIn(organizationId, slug);
      setPageData(next);
      const clockInAt = next.activeSession?.clockInAt;
      Alert.alert(
        'Clocked in',
        clockInAt
          ? `Clocked in at ${formatWallClockTime(new Date(clockInAt))}`
          : 'Your session has started.',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not clock in.';
      Alert.alert('Clock in failed', message);
      void reportError('my_hours.clock_in', err);
    } finally {
      setClockActionPending(null);
    }
  }, [
    previewReadOnly,
    activeSessionStartedAt,
    clockActionPending,
    organizationId,
    slug,
    reportError,
  ]);

  const handleClockOut = useCallback(async () => {
    if (previewReadOnly || !activeSessionStartedAt || clockActionPending) return;
    setClockActionPending('out');
    try {
      const { pageData: next, sessionMinutes } = await postTeacherMyHoursClockOut(
        organizationId,
        slug,
      );
      setPageData(next);
      Alert.alert(
        'Session saved',
        `Logged ${formatHoursMinutes(Math.max(1, sessionMinutes))}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not clock out.';
      Alert.alert('Clock out failed', message);
      void reportError('my_hours.clock_out', err);
    } finally {
      setClockActionPending(null);
    }
  }, [
    previewReadOnly,
    activeSessionStartedAt,
    clockActionPending,
    organizationId,
    slug,
    reportError,
  ]);

  const shiftFocusDate = useCallback(
    (delta: number) => {
      setFocusDate((current) => {
        const next = addDays(current, delta);
        if (view === 'month') {
          setMonthDate(next);
        }
        return next;
      });
    },
    [view],
  );

  const shiftMonth = useCallback((deltaMonths: number) => {
    setMonthDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + deltaMonths, 1);
      setFocusDate(next);
      return next;
    });
  }, []);

  const openDayDetail = useCallback((date: Date) => {
    setFocusDate(date);
    setView('day');
  }, []);

  const handlePreviousDate = useCallback(() => {
    if (view === 'month') {
      shiftMonth(-1);
    } else {
      shiftFocusDate(view === 'week' ? -7 : -1);
    }
  }, [shiftFocusDate, shiftMonth, view]);

  const handleNextDate = useCallback(() => {
    if (view === 'month') {
      shiftMonth(1);
    } else {
      shiftFocusDate(view === 'week' ? 7 : 1);
    }
  }, [shiftFocusDate, shiftMonth, view]);

  const handleBack = () => {
    goBackOrReplace(router, teacherTabRoute(slug, 'home'));
  };

  if (!myHoursEnabled && homeData) {
    return (
      <View style={[styles.root, { backgroundColor: Story.paper }]}>
        <View style={styles.disabledWrap}>
          <StoryCard compact style={styles.disabledCard}>
            <StorySectionKicker>My Hours</StorySectionKicker>
            <StoryDisplayHeading size="section">My Hours is not enabled</StoryDisplayHeading>
            <Text style={[styles.disabledCopy, { color: theme.muted }]}>
              Your school has not turned on My Hours for teachers in the mobile app.
            </Text>
          </StoryCard>
        </View>
      </View>
    );
  }

  if (loading && !pageData) {
    return (
      <View style={[styles.root, { backgroundColor: Story.paper }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: TEACHER_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
          ]}>
          <TeacherMyHoursSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (error && !pageData) {
    return (
      <View style={[styles.root, { backgroundColor: Story.paper }]}>
        <View style={styles.errorWrap}>
          <StoryErrorBanner message={error} />
          <StoryButton
            label="Try again"
            previewSafe
            onPress={() => void load('initial')}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  if (!pageData) {
    return null;
  }

  const showPreviewBanner = isPreviewSessionActive();

  const dateNavLabel =
    view === 'month' ? formatMonthYear(monthDate) : formatCompactNavDate(focusDate);

  const dateNavProps = {
    navLabel: dateNavLabel,
    onPreviousDate: handlePreviousDate,
    onNextDate: handleNextDate,
  };

  return (
    <View style={[styles.root, { backgroundColor: Story.paper }]} testID="teacher-my-hours-page">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TEACHER_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor={theme.primary}
          />
        }>
        <View style={styles.contentColumn}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to More"
          onPress={handleBack}
          style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
        </Pressable>

        <TeacherMyHoursViewNav
          view={view}
          onViewChange={(nextView) => {
            setView(nextView);
            if (nextView === 'month') {
              setMonthDate(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
            }
          }}
        />

        {showPreviewBanner ? (
          <View style={[styles.previewBanner, { backgroundColor: theme.infoBg }]}>
            <Text style={[styles.previewBannerText, { color: theme.info }]}>
              Preview — clock in/out disabled
            </Text>
          </View>
        ) : null}

        {error ? <StoryErrorBanner message={error} /> : null}

        {view === 'day' ? (
          <TeacherMyHoursDayPanel
            {...dateNavProps}
            focusDate={focusDate}
            referenceDate={referenceDate}
            dayLog={dayLog}
            closedSessions={closedSessionsForFocusDay}
            activeSessionStartedAt={activeOnFocusDay}
            elapsedSeconds={elapsedSeconds}
            clockActionPending={clockActionPending}
            clockDisabled={previewReadOnly || !isSameDay(focusDate, referenceDate)}
            onClockIn={() => void handleClockIn()}
            onClockOut={() => void handleClockOut()}
          />
        ) : null}

        {view === 'week' ? (
          <TeacherMyHoursWeekPanel
            {...dateNavProps}
            entriesByDateKey={pageData.entriesByDateKey}
            focusDate={focusDate}
            referenceDate={referenceDate}
            onDaySelect={openDayDetail}
          />
        ) : null}

        {view === 'month' ? (
          <TeacherMyHoursMonthPanel
            {...dateNavProps}
            entriesByDateKey={pageData.entriesByDateKey}
            monthDate={monthDate}
            referenceDate={referenceDate}
            onDaySelect={openDayDetail}
          />
        ) : null}

        <TeacherMyHoursSummaryCards
          summary={pageData.sidebar}
          clockedIn={activeSessionStartedAt != null}
          todayLiveMinutes={sidebarTodayMinutes}
        />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MY_HOURS_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  contentColumn: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  previewBanner: {
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  previewBannerText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: MY_HOURS_HORIZONTAL_PADDING,
  },
  disabledCard: {
    padding: MY_HOURS_CARD_BODY_PADDING,
    gap: Spacing.two,
  },
  disabledCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: MY_HOURS_HORIZONTAL_PADDING,
    gap: Spacing.four,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
});
