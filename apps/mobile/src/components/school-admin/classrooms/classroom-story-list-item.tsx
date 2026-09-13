import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomStatus, ClassroomSummary } from '@/lib/school-admin/classrooms';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ClassroomStoryListItemProps = {
  classroom: ClassroomSummary;
  onPress: (classroom: ClassroomSummary) => void;
};

const STATUS_LABELS: Record<ClassroomStatus, string> = {
  open: 'Open',
  full: 'Full',
  inactive: 'Inactive',
};

function statusTone(status: ClassroomStatus): 'success' | 'warning' | 'info' {
  if (status === 'open') return 'success';
  if (status === 'full') return 'warning';
  return 'info';
}

export function ClassroomStoryListItem({ classroom, onPress }: ClassroomStoryListItemProps) {
  const theme = useParentTheme();
  const teacherLine =
    classroom.leadTeacherNames.length > 0
      ? classroom.leadTeacherNames.join(', ')
      : 'No lead teacher';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={classroom.name}
      onPress={() => onPress(classroom)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.topRow}>
          <StoryDisplayHeading size="section" numberOfLines={1} style={styles.title}>
            {classroom.name}
          </StoryDisplayHeading>
          <StoryChip tone={statusTone(classroom.status)} label={STATUS_LABELS[classroom.status]} />
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {classroom.studentCount} students · {classroom.staffCount} staff
          {classroom.programName ? ` · ${classroom.programName}` : ''}
        </Text>
        <Text style={[styles.teacher, { color: theme.muted }]} numberOfLines={1}>
          {teacherLine}
        </Text>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  teacher: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
