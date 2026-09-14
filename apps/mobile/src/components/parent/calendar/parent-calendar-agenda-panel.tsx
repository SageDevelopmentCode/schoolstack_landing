import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import type { OrganizationEvent } from '@/lib/school-events/types';
import {
  eventTypeChipTone,
  formatAgendaEventMeta,
  listUpcomingCalendarEvents,
  SCHOOL_EVENT_TYPE_LABELS,
} from '@/lib/parent/parent-calendar-agenda-utils';

type ParentCalendarAgendaPanelProps = {
  events: OrganizationEvent[];
  selectedEventId?: string | null;
  onEventPress: (event: OrganizationEvent) => void;
  agendaTitle?: string;
};

export function ParentCalendarAgendaPanel({
  events,
  selectedEventId = null,
  onEventPress,
  agendaTitle = 'Family agenda',
}: ParentCalendarAgendaPanelProps) {
  const theme = useParentTheme();
  const upcomingEvents = listUpcomingCalendarEvents(events);

  return (
    <StoryCard compact style={styles.card}>
      <StorySectionKicker style={styles.kicker}>Next up</StorySectionKicker>
      <StoryDisplayHeading size="section" style={styles.heading}>
        {agendaTitle}
      </StoryDisplayHeading>

      {upcomingEvents.length === 0 ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No upcoming events — your school calendar will appear here when events are added.
        </Text>
      ) : (
        <View style={styles.list}>
          {upcomingEvents.map((event, index) => {
            const isSelected = selectedEventId === event.id;
            return (
              <Animated.View
                key={event.id}
                entering={FadeInDown.duration(220).delay(index * 40)}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onEventPress(event)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.rowBorder,
                    { borderTopColor: theme.line },
                    isSelected && {
                      backgroundColor: theme.primarySoft,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                    },
                    pressed && { opacity: 0.9 },
                  ]}>
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.muted }]} numberOfLines={2}>
                      {formatAgendaEventMeta(event, formatEventTimeRange(event))}
                    </Text>
                  </View>
                  <StoryChip
                    tone={eventTypeChipTone(event.type)}
                    label={SCHOOL_EVENT_TYPE_LABELS[event.type]}
                    style={styles.chip}
                  />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  kicker: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.three,
  },
  list: {
    marginTop: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  chip: {
    marginTop: 2,
  },
});
