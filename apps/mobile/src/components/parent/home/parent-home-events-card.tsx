import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { OrganizationEvent } from '@/lib/school-events/types';

type ParentHomeEventsCardProps = {
  nextEvent: OrganizationEvent | null;
  onViewCalendar: () => void;
};

function formatEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function ParentHomeEventsCard({ nextEvent, onViewCalendar }: ParentHomeEventsCardProps) {
  return (
    <StoryCard variant="primary" style={styles.card}>
      <StorySectionKicker light>Upcoming events</StorySectionKicker>

      {nextEvent ? (
        <View style={styles.eventPreview}>
          <Text style={styles.eventTitle}>{nextEvent.title}</Text>
          <Text style={styles.eventMeta}>
            {formatEventDate(nextEvent.date)}
            {!nextEvent.isAllDay && nextEvent.time ? ` · ${nextEvent.time}` : ''}
          </Text>
        </View>
      ) : (
        <Text style={styles.emptyCopy}>No upcoming events right now.</Text>
      )}

      <StoryTextLink
        label="View family calendar"
        variant="light"
        onPress={onViewCalendar}
        style={styles.calendarLink}
      />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.five,
  },
  eventPreview: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  eventTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  eventMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#D4E0D7',
    lineHeight: 18,
    marginTop: 2,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#D5E3D9',
  },
  calendarLink: {
    marginTop: Spacing.four,
    paddingVertical: 0,
  },
});
