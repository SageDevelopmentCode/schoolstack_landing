import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { childAccentBg } from '@/lib/teacher/teacher-home-utils';
import type { StaffClassroomOption } from '@/lib/teacher/teacher-portal-api';

type TeacherHomeClassroomCardProps = {
  classroom: StaffClassroomOption;
  index: number;
  onViewStudents: () => void;
};

export function TeacherHomeClassroomCard({
  classroom,
  index,
  onViewStudents,
}: TeacherHomeClassroomCardProps) {
  const theme = useParentTheme();
  const accentBg = childAccentBg(index);
  const studentLabel = `${classroom.studentCount} student${classroom.studentCount === 1 ? '' : 's'}`;

  return (
    <StoryCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: accentBg }]}>
          <Ionicons name="people-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.name, { color: theme.ink }]}>{classroom.name}</Text>
          <Text style={styles.meta}>{studentLabel}</Text>
        </View>
      </View>
      <StoryButton
        label="View students"
        variant="outline"
        onPress={onViewStudents}
        trailingIcon={<Ionicons name="arrow-forward" size={16} color={theme.primary} />}
      />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#7B878D',
  },
});
