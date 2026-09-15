import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  SCHEDULE_TABS,
  type ScheduleTabId,
} from '@/components/school-admin/schedule/schedule-constants';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ScheduleStoryHeaderProps = {
  activeTab: ScheduleTabId;
  timezoneLabel: string;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  upcomingVisitCount: number | null;
  loadingTabKey?: ScheduleTabId | null;
  onTabChange: (tab: ScheduleTabId) => void;
};

function formatOverviewSubtitle(
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  const parts: string[] = [];

  if (monthSlotCount != null) {
    parts.push(`${monthSlotCount} open slot${monthSlotCount === 1 ? '' : 's'}`);
  }
  if (monthObservationDayCount != null) {
    parts.push(`${monthObservationDayCount} shadow day${monthObservationDayCount === 1 ? '' : 's'}`);
  }
  if (upcomingVisitCount != null) {
    parts.push(`${upcomingVisitCount} upcoming visit${upcomingVisitCount === 1 ? '' : 's'}`);
  }

  return parts.join(' · ');
}

function subtitleForTab(
  tab: ScheduleTabId,
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  switch (tab) {
    case 'overview':
      return (
        formatOverviewSubtitle(monthSlotCount, monthObservationDayCount, upcomingVisitCount) ||
        'Tours, shadow days, and school events in one place'
      );
    case 'events':
      return 'School-wide events families see in the parent portal';
    case 'tours':
      return 'Set 30-minute slots for campus tours and family interviews';
    case 'shadow':
      return 'Configure whole-day, grade-targeted, or grade + time shadow visits';
    case 'visits':
      return 'Every booked tour, interview, and shadow day';
  }
}

export function ScheduleStoryHeader({
  activeTab,
  timezoneLabel,
  monthSlotCount,
  monthObservationDayCount,
  upcomingVisitCount,
  loadingTabKey = null,
  onTabChange,
}: ScheduleStoryHeaderProps) {
  const theme = useParentTheme();
  const subtitle = subtitleForTab(
    activeTab,
    monthSlotCount,
    monthObservationDayCount,
    upcomingVisitCount,
  );

  const pillItems = SCHEDULE_TABS.map((tab) => ({
    key: tab.id,
    label: tab.label,
    testID: `schedule-tab-${tab.id}`,
    suffix:
      loadingTabKey === tab.id ? (
        <ActivityIndicator size="small" color={theme.primary} testID="schedule-tab-loading" />
      ) : undefined,
  }));

  return (
    <View style={styles.container} testID="schedule-story-header">
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <StorySectionKicker style={styles.kicker}>School calendar</StorySectionKicker>
          <StoryDisplayHeading size="display">Schedule</StoryDisplayHeading>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
        </View>
        <View style={[styles.timezonePill, { backgroundColor: theme.white, borderColor: theme.line }]}>
          <Ionicons name="time-outline" size={12} color={theme.muted} />
          <Text style={[styles.timezoneLabel, { color: theme.muted }]} numberOfLines={1}>
            {timezoneLabel}
          </Text>
        </View>
      </View>

      <StoryPillNav
        items={pillItems}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as ScheduleTabId)}
        accessibilityLabel="Schedule sections"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
  timezonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '42%',
  },
  timezoneLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
});
