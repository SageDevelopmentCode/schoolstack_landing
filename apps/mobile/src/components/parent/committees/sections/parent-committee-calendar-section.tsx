import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentCommitteeCalendarSectionProps = {
  committee: Committee;
};

export function ParentCommitteeCalendarSection({ committee }: ParentCommitteeCalendarSectionProps) {
  const theme = useParentTheme();
  const events = [...committee.events].sort((a, b) => a.date.localeCompare(b.date));

  if (events.length === 0) {
    return (
      <StoryDetailSection title="Calendar">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No upcoming dates.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Calendar">
      <View style={styles.list}>
        {events.map((event) => (
          <StoryCard key={event.id} compact style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.dateBadge, { backgroundColor: '#EAF4EB' }]}>
                <Text style={[styles.dateMonth, { color: theme.primary }]}>
                  {new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dateDay, { color: theme.primary }]}>
                  {new Date(`${event.date}T00:00:00`).getDate()}
                </Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.ink }]}>{event.title}</Text>
                <Text style={[styles.meta, { color: theme.muted }]}>
                  {event.type}
                  {event.time ? ` · ${event.time}` : ''}
                  {event.location ? ` · ${event.location}` : ''}
                </Text>
              </View>
            </View>
          </StoryCard>
        ))}
      </View>
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  dateBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 9,
  },
  dateDay: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
