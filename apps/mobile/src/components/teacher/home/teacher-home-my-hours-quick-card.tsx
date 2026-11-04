import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryTextLink } from '@/components/story/story-text-link';
import { MY_HOURS_CARD_BODY_PADDING } from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatWallClockTime,
} from '@/lib/teacher/my-hours/format-duration';
import {
  fetchTeacherMyHoursPageData,
  postTeacherMyHoursClockIn,
  postTeacherMyHoursClockOut,
} from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type { ClockActionPending, TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';
import { teacherMoreRoute } from '@/lib/teacher/teacher-nav';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type TeacherHomeMyHoursQuickCardProps = {
  organizationId: string;
  slug: string;
  refreshKey?: number;
};

export function TeacherHomeMyHoursQuickCard({
  organizationId,
  slug,
  refreshKey = 0,
}: TeacherHomeMyHoursQuickCardProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const previewReadOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [pageData, setPageData] = useState<TeacherMyHoursPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(null);

  const load = useCallback(async () => {
    try {
      const next = await fetchTeacherMyHoursPageData(organizationId, slug);
      setPageData(next);
    } catch (err) {
      void reportError('my_hours.home_quick_card_load', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, slug, reportError]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (refreshKey > 0) {
      void load();
    }
  }, [refreshKey, load]);

  const activeSessionStartedAt = useMemo(() => {
    if (!pageData?.activeSession) return null;
    return new Date(pageData.activeSession.clockInAt);
  }, [pageData?.activeSession]);

  const elapsedSeconds = useLiveElapsed(activeSessionStartedAt);
  const clockedIn = activeSessionStartedAt != null;

  const week = pageData?.sidebar.week;
  const weekProgress =
    week && week.goalMinutes
      ? Math.min(100, (week.loggedMinutes / week.goalMinutes) * 100)
      : 0;

  const clockDisabled =
    previewReadOnly || clockActionPending != null || (loading && !pageData);

  const handleClockIn = useCallback(async () => {
    if (previewReadOnly || clockedIn || clockActionPending) return;
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
    clockedIn,
    clockActionPending,
    organizationId,
    slug,
    reportError,
  ]);

  const handleClockOut = useCallback(async () => {
    if (previewReadOnly || !clockedIn || clockActionPending) return;
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
    clockedIn,
    clockActionPending,
    organizationId,
    slug,
    reportError,
  ]);

  const openMyHours = useCallback(() => {
    router.push(teacherMoreRoute(slug, 'my-hours'));
  }, [router, slug]);

  return (
    <StoryCard style={styles.card} testID="teacher-home-my-hours-quick-card">
      <View style={styles.headerRow}>
        <View testID="teacher-home-my-hours-status">
          <StoryChip
            tone={clockedIn ? 'success' : 'neutral'}
            label={clockedIn ? 'Clocked in' : 'Not clocked in'}
            uppercase={false}
          />
        </View>
        <StoryTextLink label="View all hours" onPress={openMyHours} />
      </View>

      {loading && !pageData ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : week ? (
        <>
          {clockedIn && activeSessionStartedAt ? (
            <View style={styles.sessionBlock}>
              <Text style={[styles.liveTimer, { color: theme.ink }]}>
                {formatLiveElapsed(elapsedSeconds)}
              </Text>
              <Text style={[styles.sessionMeta, { color: theme.muted }]}>
                Started at {formatWallClockTime(activeSessionStartedAt)}
              </Text>
            </View>
          ) : null}

          <View style={styles.weekBlock}>
            <Text style={[styles.weekKicker, { color: theme.muted }]}>THIS WEEK</Text>
            <Text style={[styles.weekTotal, { color: theme.ink }]}>
              {formatHoursMinutes(week.loggedMinutes)}
              <Text style={[styles.weekGoalInline, { color: theme.muted }]}>
                {' '}
                of {formatHoursMinutes(week.goalMinutes)}
              </Text>
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: '#E6ECE7' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${weekProgress}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
          </View>

          <StoryButton
            label={
              clockActionPending === 'in'
                ? 'Clocking in…'
                : clockActionPending === 'out'
                  ? 'Clocking out…'
                  : clockedIn
                    ? 'Clock out'
                    : 'Clock in'
            }
            onPress={clockedIn ? handleClockOut : handleClockIn}
            disabled={clockDisabled}
            variant="primary"
            style={styles.clockButton}
          />
        </>
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: MY_HOURS_CARD_BODY_PADDING,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  loadingRow: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  sessionBlock: {
    gap: 4,
  },
  liveTimer: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  sessionMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  weekBlock: {
    gap: Spacing.one,
  },
  weekKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  weekTotal: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '600',
  },
  weekGoalInline: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    fontWeight: '400',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  clockButton: {
    marginTop: Spacing.one,
  },
});
