import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import type { ScheduleTabId } from '@/components/school-admin/schedule/schedule-constants';
import { ScheduleSummaryCards } from '@/components/school-admin/schedule/schedule-summary-cards';
import { VisitListItem } from '@/components/school-admin/schedule/visit-list-item';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from '@/lib/admissions/admin-scheduled-visits';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import { listUpcomingEventsForOrg } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

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
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

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
      setError(loadError instanceof Error ? loadError.message : 'Failed to load schedule overview.');
      setVisits([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
      setEventsLoading(false);
    }
  }, [organizationId, supabase]);

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
          tintColor={theme.accent}
        />
      }>
      <ScheduleSummaryCards
        monthSlotCount={monthSlotCount}
        monthObservationDayCount={monthObservationDayCount}
        upcomingVisitCount={loading ? null : upcomingCount}
        onPressTours={() => onTabChange('tours')}
        onPressShadow={() => onTabChange('shadow')}
        onPressVisits={() => onTabChange('visits')}
      />

      <SectionHeader
        title="Upcoming agenda"
        subtitle="Next tours, interviews, and shadow visits"
        actionLabel="View all"
        onAction={() => onTabChange('visits')}
      />

      {loading ? (
        <LoadingCard label="Loading upcoming visits…" />
      ) : error ? (
        <ThemedText type="small" style={{ color: theme.error }}>
          {error}
        </ThemedText>
      ) : upcomingVisits.length === 0 ? (
        <EmptyCard
          message="No upcoming visits yet. Families book after submitting an application."
          actions={[
            { label: 'Set tour slots', onPress: () => onTabChange('tours') },
            { label: 'Open shadow days', onPress: () => onTabChange('shadow') },
          ]}
        />
      ) : (
        <View style={styles.list}>
          {visitsByDate.map(([date, dayVisits]) => (
            <View key={date} style={styles.group}>
              <ThemedText type="smallBold" style={{ color: theme.textTertiary }}>
                {dayVisits[0]?.whenLabel.split('·')[0]?.trim() ?? date}
              </ThemedText>
              {dayVisits.map((visit) => (
                <VisitListItem
                  key={visit.id}
                  visit={visit}
                  onPress={visit.applicationId ? () => handleVisitPress(visit) : undefined}
                />
              ))}
            </View>
          ))}
        </View>
      )}

      <SectionHeader
        title="Upcoming school events"
        subtitle="Events families see in the parent portal"
        actionLabel="Manage events"
        onAction={() => onTabChange('events')}
      />

      {eventsLoading ? (
        <LoadingCard label="Loading school events…" />
      ) : upcomingEvents.length === 0 ? (
        <EmptyCard
          message="No school events yet. Add field trips, no-school days, and community events."
          actions={[{ label: 'Add event', onPress: () => onTabChange('events') }]}
        />
      ) : (
        <View style={styles.list}>
          {upcomingEvents.map((event) => {
            const colors = getEventDisplayStyle(event);
            return (
              <Pressable
                key={event.id}
                accessibilityRole="button"
                onPress={() => onTabChange('events')}
                style={[styles.eventRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <View style={styles.eventCopy}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    {event.title}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {event.date}
                    {!event.isAllDay && event.time ? ` · ${event.time}` : ''}
                  </ThemedText>
                </View>
                <View style={[styles.eventBadge, { backgroundColor: colors.bg }]}>
                  <ThemedText type="small" style={{ color: colors.text }}>
                    {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const theme = useAdminTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {subtitle}
        </ThemedText>
      </View>
      <Pressable accessibilityRole="button" onPress={onAction}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {actionLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

function LoadingCard({ label }: { label: string }) {
  const theme = useAdminTheme();
  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
    </View>
  );
}

function EmptyCard({
  message,
  actions,
}: {
  message: string;
  actions: Array<{ label: string; onPress: () => void }>;
}) {
  const theme = useAdminTheme();
  return (
    <View style={[styles.card, styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.accentGlow }]}>
        <Ionicons name="calendar-outline" size={22} color={theme.accent} />
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
        {message}
      </ThemedText>
      <View style={styles.emptyActions}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={action.onPress}
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  sectionCopy: {
    flex: 1,
    gap: 2,
  },
  list: {
    gap: Spacing.two,
  },
  group: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.four,
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  primaryButton: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  eventCopy: {
    flex: 1,
    gap: 2,
  },
  eventBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
});
