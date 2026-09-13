import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ClassroomsStoryHeaderProps = {
  classroomCount: number;
  totalStudents: number;
};

export function ClassroomsStoryHeader({
  classroomCount,
  totalStudents,
}: ClassroomsStoryHeaderProps) {
  const theme = useParentTheme();
  const subtitle =
    classroomCount === 1
      ? `1 classroom · ${totalStudents} rostered students`
      : `${classroomCount} classrooms · ${totalStudents} rostered students`;

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>My School workspace</StorySectionKicker>
      <StoryDisplayHeading size="display">Classrooms</StoryDisplayHeading>
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
