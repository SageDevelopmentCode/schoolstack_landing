import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { OrganizationEvent } from '@/lib/school-events/types';

type TeacherHomeSnapshotCardProps = {
  schoolName: string;
  studentCount: number;
  myStudentsEnabled: boolean;
  nextEvent: OrganizationEvent | null;
  calendarEnabled: boolean;
  onViewCalendar?: () => void;
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

export function TeacherHomeSnapshotCard({
  schoolName,
  studentCount,
  myStudentsEnabled,
  nextEvent,
  calendarEnabled,
  onViewCalendar,
}: TeacherHomeSnapshotCardProps) {
  const snapshotTitle =
    studentCount > 0
      ? `${studentCount} learner${studentCount === 1 ? '' : 's'} in your care`
      : 'Your classroom';

  const snapshotBody =
    studentCount > 0
      ? `You're assigned to ${studentCount} enrolled learner${studentCount === 1 ? '' : 's'} at ${schoolName}.`
      : myStudentsEnabled
        ? 'No learners are assigned to you yet. Your administrator can link students from the staff directory.'
        : `Welcome to ${schoolName}'s staff portal.`;

  return (
    <StoryCard variant="primary" style={styles.card}>
      <StorySectionKicker light style={styles.kicker}>Classroom snapshot</StorySectionKicker>
      <Text style={styles.title}>{snapshotTitle}</Text>
      <Text style={styles.body}>{snapshotBody}</Text>

      {nextEvent ? (
        <View style={styles.eventPreview}>
          <Text style={styles.eventTitle}>{nextEvent.title}</Text>
          <Text style={styles.eventMeta}>
            {formatEventDate(nextEvent.date)}
            {!nextEvent.isAllDay && nextEvent.time ? ` · ${nextEvent.time}` : ''}
          </Text>
        </View>
      ) : null}

      {calendarEnabled && onViewCalendar ? (
        <StoryTextLink
          label="View school calendar"
          variant="light"
          onPress={onViewCalendar}
          style={styles.calendarLink}
        />
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  kicker: {
    marginBottom: 6,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: Spacing.one,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#D5E3D9',
  },
  eventPreview: {
    marginTop: Spacing.three,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
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
  calendarLink: {
    marginTop: Spacing.two,
    paddingVertical: 0,
  },
});
