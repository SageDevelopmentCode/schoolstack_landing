import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import type { ScheduleTabId } from '@/components/school-admin/schedule/schedule-constants';
import { ScheduleMetricRow } from '@/components/school-admin/schedule/schedule-metric-row';
import { VisitStoryListItem } from '@/components/school-admin/schedule/visit-story-list-item';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from '@/lib/admissions/admin-scheduled-visits';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import { listUpcomingEventsForOrg } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ScheduleOverviewTabProps = {
  organizationId: string;
  slug: string;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  onTabChange: (tab: ScheduleTabId) => void;
  onUpcomingCountChange?: (count: number) => void;
  refreshing: boolean;
  onRefresh: () => void;
};

function SectionHeader({
  kicker,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <StorySectionKicker style={styles.sectionKicker}>{kicker}</StorySectionKicker>
        <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <StoryTextLink label={actionLabel} onPress={onAction} style={styles.sectionAction} />
    </View>
  );
}

export function ScheduleOverviewTab({
  organizationId,
  slug,
  monthSlotCount,
  monthObservationDayCount,
  onTabChange,
  onUpcomingCountChange,
  refreshing,
  onRefresh,
}: ScheduleOverviewTabProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setEventsLoading(true);
    setError(null);
    try {
      const [visitRows, eventRows] = await Promise.all([
        listOrgScheduledVisits(supabase, organizationId),
        listUpcomingEventsForOrg(supabase, organizationId, 5),
      ]);
      setVisits(visitRows);
      setUpcomingEvents(eventRows);
    } catch (loadError) {
      reportError('school_admin_schedule_overview_load', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load schedule overview.');
      setVisits([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
      setEventsLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const upcomingVisits = useMemo(
    () =>
      visits
        .filter((visit) => visit.timing === 'upcoming' || visit.timing === 'happening')
        .slice(0, 7),
    [visits],
  );

  const upcomingCount = useMemo(
    () => visits.filter((visit) => visit.timing === 'upcoming').length,
    [visits],
  );

  useEffect(() => {
    if (!loading) onUpcomingCountChange?.(upcomingCount);
  }, [loading, onUpcomingCountChange, upcomingCount]);

  const visitsByDate = useMemo(() => {
    const groups = new Map<string, AdminScheduledVisit[]>();
    for (const visit of upcomingVisits) {
      const existing = groups.get(visit.scheduledDate) ?? [];
      existing.push(visit);
      groups.set(visit.scheduledDate, existing);
    }
    return [...groups.entries()];
  }, [upcomingVisits]);

  const handleVisitPress = (visit: AdminScheduledVisit) => {
    if (!visit.applicationId) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${visit.applicationId}`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            onRefresh();
            void loadData();
          }}
          tintColor={theme.primary}
        />
      }>
      <ScheduleMetricRow
        monthSlotCount={monthSlotCount}
        monthObservationDayCount={monthObservationDayCount}
        upcomingVisitCount={loading ? null : upcomingCount}
        onPressTours={() => onTabChange('tours')}
        onPressShadow={() => onTabChange('shadow')}
        onPressVisits={() => onTabChange('visits')}
      />

      <StoryCard style={styles.card}>
        <SectionHeader
          kicker="Upcoming agenda"
          title="Next visits"
          subtitle="Tours, interviews, and shadow visits on your calendar"
          actionLabel="View all"
          onAction={() => onTabChange('visits')}
        />

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading upcoming visits…</Text>
          </View>
        ) : error ? (
          <StoryErrorBanner message={error} />
        ) : upcomingVisits.length === 0 ? (
          <View style={styles.emptyBlock}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="calendar-outline" size={22} color={theme.primary} />
            </View>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No upcoming visits yet. Families book after submitting an application.
            </Text>
            <View style={styles.emptyActions}>
              <StoryButton
                label="Set tour slots"
                variant="soft"
                onPress={() => onTabChange('tours')}
                style={styles.emptyButton}
              />
              <StoryButton
                label="Open shadow days"
                variant="soft"
                onPress={() => onTabChange('shadow')}
                style={styles.emptyButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            {visitsByDate.map(([date, dayVisits], groupIndex) => (
              <View key={date}>
                <Text
                  style={[
                    styles.dateLabel,
                    groupIndex > 0 && { borderTopColor: '#EDF1ED', borderTopWidth: StyleSheet.hairlineWidth },
                  ]}>
                  {dayVisits[0]?.whenLabel.split('·')[0]?.trim() ?? date}
                </Text>
                {dayVisits.map((visit, visitIndex) => (
                  <View
                    key={visit.id}
                    style={
                      visitIndex > 0 || groupIndex > 0
                        ? { borderTopColor: '#E9EFEA', borderTopWidth: StyleSheet.hairlineWidth }
                        : undefined
                    }>
                    <VisitStoryListItem
                      visit={visit}
                      onPress={visit.applicationId ? () => handleVisitPress(visit) : undefined}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </StoryCard>

      <StoryCard style={styles.card}>
        <SectionHeader
          kicker="School events"
          title="On the calendar"
          subtitle="Events families see in the parent portal"
          actionLabel="Manage"
          onAction={() => onTabChange('events')}
        />

        {eventsLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading school events…</Text>
          </View>
        ) : upcomingEvents.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No school events yet. Add field trips, no-school days, and community events.
            </Text>
            <StoryButton
              label="Add event"
              variant="soft"
              onPress={() => onTabChange('events')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {upcomingEvents.map((event, index) => {
              const colors = getEventDisplayStyle(event);
              return (
                <Pressable
                  key={event.id}
                  accessibilityRole="button"
                  onPress={() => onTabChange('events')}
                  style={[
                    styles.eventRow,
                    index > 0 && { borderTopColor: '#E9EFEA', borderTopWidth: StyleSheet.hairlineWidth },
                  ]}>
                  <View style={styles.eventCopy}>
                    <Text numberOfLines={1} style={[styles.eventTitle, { color: theme.ink }]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventMeta, { color: theme.muted }]}>
                      {event.date}
                      {!event.isAllDay && event.time ? ` · ${event.time}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.eventBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.eventBadgeLabel, { color: colors.text }]}>
                      {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </StoryCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  card: {
    padding: StoryCardPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionKicker: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#65777F',
    marginTop: Spacing.one,
  },
  sectionAction: {
    paddingVertical: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  loadingCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBlock: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyActions: {
    width: '100%',
    gap: Spacing.two,
  },
  emptyButton: {
    width: '100%',
  },
  list: {
    gap: 0,
  },
  dateLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8B9699',
    paddingVertical: Spacing.two,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  eventCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eventTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  eventMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
  eventBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventBadgeLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
  },
});
