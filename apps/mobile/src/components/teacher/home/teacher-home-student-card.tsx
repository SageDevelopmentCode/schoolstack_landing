import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  childAccentBg,
  formatEnrolledStudentName,
  studentSubtitleLine,
} from '@/lib/teacher/teacher-home-utils';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';

type TeacherHomeStudentCardProps = {
  student: AdminEnrolledStudentSummary;
  index: number;
  onViewProfile: () => void;
};

export function TeacherHomeStudentCard({
  student,
  index,
  onViewProfile,
}: TeacherHomeStudentCardProps) {
  const theme = useParentTheme();
  const studentFirstName = student.firstName.trim() || formatEnrolledStudentName(student);
  const accentBg = childAccentBg(index);

  return (
    <StoryCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.photoWrap, { backgroundColor: accentBg }]}>
          <StudentPhoto
            name={formatEnrolledStudentName(student)}
            photoUrl={student.profilePhotoUrl}
            size="lg"
            showHealthIndicator={student.hasStandingHealthItems}
          />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: theme.ink }]}>{studentFirstName}</Text>
            <StoryChip tone="success" label="Enrolled" />
          </View>
          <Text style={styles.subtitle}>{studentSubtitleLine(student)}</Text>
        </View>
      </View>
      <StoryButton
        label="View profile"
        variant="outline"
        onPress={onViewProfile}
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
  photoWrap: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    flex: 1,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#7B878D',
  },
});
