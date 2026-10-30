import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentCoopTeachingScheduleSkeleton } from '@/components/parent/coop/parent-coop-teaching-schedule-skeleton';
import { ParentCoopTeachingScheduleStoryHeader } from '@/components/parent/coop/parent-coop-teaching-schedule-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  COOP_TEACHING_SCHEDULE_MAX_ASSIGNED_FAMILIES_PER_ROLE,
  MOBILE_TEACHING_SCHEDULE_FILTER_PILLS,
  canParentSignUpForTeachingRole,
  computeTeachingScheduleSummary,
  filterMobileTeachingScheduleWeeks,
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
  getTeachingScheduleFamilyIdsForRole,
  isTeachingParentAssigned,
  isTeachingWeekPast,
  sortTeachingScheduleWeeks,
  teachingScheduleWeekDisplayName,
  type MobileTeachingScheduleFilterKey,
  type TeachingScheduleParentRole,
} from '@/lib/parent/coop/teaching-schedule-helpers';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  fetchParentCoopTeachingSchedulePageData,
  signupParentCoopTeachingSchedule,
  withdrawParentCoopTeachingSchedule,
  type ParentCoopTeachingScheduleWeek,
} from '@/lib/parent/parent-portal-api';

type ParentCoopTeachingScheduleScreenProps = {
  organizationId: string;
  programId: string;
};

function SummaryStatCard({
  label,
  value,
  ink,
  muted,
  compactValue,
}: {
  label: string;
  value: string;
  ink: string;
  muted: string;
  compactValue?: boolean;
}) {
  return (
    <StoryCard compact style={styles.summaryCard}>
      <Text style={[styles.summaryLabel, { color: muted }]}>{label}</Text>
      <Text
        style={[compactValue ? styles.summaryValueCompact : styles.summaryValue, { color: ink }]}
        numberOfLines={compactValue ? 2 : 1}>
        {value}
      </Text>
    </StoryCard>
  );
}

export function ParentCoopTeachingScheduleScreen({
  organizationId,
  programId,
}: ParentCoopTeachingScheduleScreenProps) {
  const theme = useParentTheme();
  const previewReadOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<ParentCoopTeachingScheduleWeek[]>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState('');
  const [familyNameMap, setFamilyNameMap] = useState<Record<string, string>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState<MobileTeachingScheduleFilterKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchParentCoopTeachingSchedulePageData(organizationId, programId);
      setWeeks(data.weeks);
      setCurrentFamilyId(data.currentFamilyId);
      setFamilyNameMap(data.familyNameMap);
    } catch (loadError) {
      reportError('parent_coop_teaching_schedule_load', loadError, {
        entityType: 'program',
        entityId: programId,
      });
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load teaching schedule.',
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, programId, reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedWeeks = useMemo(() => sortTeachingScheduleWeeks(weeks), [weeks]);
  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);
  const filteredWeeks = useMemo(
    () => filterMobileTeachingScheduleWeeks(sortedWeeks, filterKey, currentFamilyId),
    [sortedWeeks, filterKey, currentFamilyId],
  );

  const filterPills = useMemo(
    () =>
      MOBILE_TEACHING_SCHEDULE_FILTER_PILLS.map((pill) => ({
        key: pill.key,
        label: pill.label,
      })),
    [],
  );

  const handleRoleToggle = async (week: ParentCoopTeachingScheduleWeek, role: TeachingScheduleParentRole) => {
    if (previewReadOnly || pendingKey) return;
    const key = `${week.id}:${role}`;
    setPendingKey(key);
    const familyIds = getTeachingScheduleFamilyIdsForRole(week, role);
    const signedUp = isTeachingParentAssigned(familyIds, currentFamilyId);
    try {
      const result = signedUp
        ? await withdrawParentCoopTeachingSchedule({
            organizationId,
            programId,
            weekId: week.id,
            role,
          })
        : await signupParentCoopTeachingSchedule({
            organizationId,
            programId,
            weekId: week.id,
            role,
          });
      setWeeks((prev) => prev.map((row) => (row.id === week.id ? result.week : row)));
    } catch (toggleError) {
      reportError('parent_coop_teaching_schedule_signup', toggleError, {
        entityType: 'program',
        entityId: programId,
      });
      await load();
    } finally {
      setPendingKey(null);
    }
  };

  const renderVolunteerRow = (
    week: ParentCoopTeachingScheduleWeek,
    role: TeachingScheduleParentRole,
    roleLabel: string,
  ) => {
    const familyIds = getTeachingScheduleFamilyIdsForRole(week, role);
    const signedUp = isTeachingParentAssigned(familyIds, currentFamilyId);
    const full = familyIds.length >= COOP_TEACHING_SCHEDULE_MAX_ASSIGNED_FAMILIES_PER_ROLE;
    const canSignUp = canParentSignUpForTeachingRole(familyIds);
    const pending = pendingKey === `${week.id}:${role}`;
    const showLiveAction = signedUp || canSignUp;

    return (
      <View key={role} style={styles.volunteerBlock}>
        <Text style={[styles.detailLine, { color: theme.muted }]}>
          <Text style={[styles.detailLabel, { color: theme.ink }]}>{roleLabel}: </Text>
          {formatTeachingAssignedParents(familyIds, familyNameMap)}
        </Text>
        {previewReadOnly ? (
          signedUp ? (
            <StoryChip tone="success" label="You're signed up" uppercase={false} />
          ) : full ? (
            <StoryChip tone="neutral" label="Full" uppercase={false} />
          ) : null
        ) : showLiveAction ? (
          <Pressable
            disabled={Boolean(pendingKey) || (!signedUp && full)}
            onPress={() => void handleRoleToggle(week, role)}
            style={[
              styles.roleAction,
              {
                backgroundColor: signedUp ? theme.primarySoft : theme.primary,
                opacity: pending ? 0.6 : 1,
              },
            ]}>
            <Text
              style={{
                color: signedUp ? theme.primary : theme.white,
                fontFamily: StoryFonts.bodyMedium,
                fontSize: 13,
              }}>
              {signedUp ? 'Withdraw' : full ? 'Full' : 'Sign up'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return <ParentCoopTeachingScheduleSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={{ color: theme.muted }}>{error}</Text>
        <StoryButton label="Try again" previewSafe onPress={() => void load()} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="parent-coop-teaching-schedule-ready"
      style={{ flex: 1, backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(280)}>
        <ParentCoopTeachingScheduleStoryHeader />
      </Animated.View>

      {weeks.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(300).delay(40)} style={styles.summaryRow}>
          <SummaryStatCard
            label="WEEKS"
            value={String(summary.weekCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
          <SummaryStatCard
            label="EVENTS"
            value={String(summary.eventCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
          <SummaryStatCard
            label="COMPLETED"
            value={String(summary.completedCount)}
            ink={theme.ink}
            muted={theme.muted}
          />
          <SummaryStatCard
            label="NEXT UP"
            value={summary.nextWeekName}
            ink={theme.ink}
            muted={theme.muted}
            compactValue
          />
        </Animated.View>
      ) : null}

      {weeks.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(300).delay(80)}>
          <StoryPillNav
            items={filterPills}
            activeKey={filterKey}
            onChange={(key) => setFilterKey(key as MobileTeachingScheduleFilterKey)}
            size="compact"
          />
        </Animated.View>
      ) : null}

      {filteredWeeks.length === 0 ? (
        <Text style={[styles.empty, { color: theme.muted }]}>
          {weeks.length === 0
            ? 'No teaching weeks have been published yet.'
            : 'No teaching weeks match the current filter.'}
        </Text>
      ) : (
        filteredWeeks.map((week, index) => {
          const isPast = isTeachingWeekPast(week);
          return (
            <Animated.View
              key={week.id}
              entering={FadeInDown.duration(280).delay(100 + index * 30)}>
              <StoryCard style={isPast ? styles.weekCardPast : undefined}>
                <View style={styles.weekCardInner}>
                  <StoryChip
                    tone={isPast ? 'neutral' : 'info'}
                    label={teachingScheduleWeekDisplayName(week)}
                    uppercase={false}
                  />
                  <Text style={[styles.dateRange, { color: theme.ink }]}>
                    {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
                  </Text>
                  {renderVolunteerRow(week, 'instructor', 'Instructor')}
                  {renderVolunteerRow(week, 'assistant', 'Assistant')}
                  {week.seasonalTheme.trim() ? (
                    <Text style={[styles.detailLine, { color: theme.muted }]}>{week.seasonalTheme}</Text>
                  ) : null}
                  {week.characterLesson.trim() ? (
                    <Text style={[styles.detailLine, { color: theme.muted }]}>{week.characterLesson}</Text>
                  ) : null}
                  {week.celebrationEvent?.trim() ? (
                    <Text style={[styles.celebration, { color: theme.ink }]}>{week.celebrationEvent}</Text>
                  ) : null}
                </View>
              </StoryCard>
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  summaryCard: {
    width: '47%',
    padding: Spacing.three,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 22,
  },
  summaryValueCompact: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    paddingVertical: Spacing.four,
  },
  weekCardPast: {
    opacity: 0.72,
  },
  weekCardInner: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  dateRange: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  detailLine: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  detailLabel: {
    fontFamily: StoryFonts.bodyMedium,
  },
  celebration: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  volunteerBlock: {
    gap: Spacing.one,
  },
  roleAction: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
});
