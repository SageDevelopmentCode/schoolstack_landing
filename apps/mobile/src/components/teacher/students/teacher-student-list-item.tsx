import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';

type TeacherStudentListItemProps = {
  student: AdminEnrolledStudentSummary;
  onPress: (student: AdminEnrolledStudentSummary) => void;
  showTeacherLabel?: boolean;
};

function classroomBadgeLabel(classroomNames: string[]): string | null {
  if (classroomNames.length === 0) return 'Unassigned';
  if (classroomNames.length === 1) return classroomNames[0];
  return `${classroomNames[0]} +${classroomNames.length - 1}`;
}

export function TeacherStudentListItem({
  student,
  onPress,
  showTeacherLabel = false,
}: TeacherStudentListItemProps) {
  const theme = useParentTheme();
  const studentName = formatEnrolledStudentName(student);
  const gradeLabel = formatStudentGrade(student.grade);
  const programLabel = student.programNames[0] ?? null;
  const classroomLabel = classroomBadgeLabel(student.classroomNames);
  const teacherLabel = student.assignedTeacherNames.trim() || null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={studentName}
      onPress={() => onPress(student)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.topRow}>
          <StudentPhoto
            name={studentName}
            photoUrl={student.profilePhotoUrl}
            size="row"
            showHealthIndicator={student.hasStandingHealthItems}
          />
          <View style={styles.mainCopy}>
            <StoryDisplayHeading size="section" numberOfLines={1} style={styles.studentName}>
              {studentName}
            </StoryDisplayHeading>
            <View style={styles.chipRow}>
              {gradeLabel ? <StoryChip tone="info" label={gradeLabel} /> : null}
              {programLabel ? <StoryChip tone="success" label={programLabel} /> : null}
            </View>
          </View>
          {classroomLabel ? (
            <View style={[styles.classroomBadge, { backgroundColor: theme.line }]}>
              <Text style={[styles.classroomText, { color: theme.muted }]} numberOfLines={1}>
                {classroomLabel}
              </Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={theme.muted} />
        </View>
        {showTeacherLabel && teacherLabel ? (
          <Text style={[styles.teacherCaption, { color: theme.muted }]} numberOfLines={1}>
            Teacher: {teacherLabel}
          </Text>
        ) : null}
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
    gap: Spacing.two,
  },
  mainCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  studentName: {
    flexShrink: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  classroomBadge: {
    maxWidth: 96,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  classroomText: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
  teacherCaption: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});
