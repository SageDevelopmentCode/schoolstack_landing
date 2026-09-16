import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { TeacherRosterScope } from '@/lib/teacher/teacher-students-utils';

type TeacherMyStudentsHeaderProps = {
  rosterScope: TeacherRosterScope;
  assignedCount: number;
  schoolCount: number | null;
};

export function TeacherMyStudentsHeader({
  rosterScope,
  assignedCount,
  schoolCount,
}: TeacherMyStudentsHeaderProps) {
  const theme = useParentTheme();

  const subtitle =
    rosterScope === 'assigned'
      ? `${assignedCount} assigned student${assignedCount === 1 ? '' : 's'}`
      : schoolCount === null
        ? 'All enrolled students at your school'
        : `${schoolCount} enrolled student${schoolCount === 1 ? '' : 's'} at your school`;

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Your classroom</StorySectionKicker>
      <StoryDisplayHeading size="display">My Students</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
  },
});
