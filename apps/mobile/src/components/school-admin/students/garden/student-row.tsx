import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { isStudentUnassigned } from '@/lib/school-admin/admin-student-roster-metrics';
import {
  formatAssignedTeachersLabel,
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { formatStudentClassroomLabel } from '@/lib/school-admin/format-student-classroom-label';

function hasAssignedTeacher(label: string): boolean {
  const normalized = label.trim().toLowerCase();
  return normalized.length > 0 && normalized !== 'unassigned';
}

/** Same caption as `StudentLeadTeacherCaption` (null when the student has no classroom). */
export function leadTeacherCaption(student: AdminEnrolledStudentSummary): string | null {
  if (student.classroomNames.length === 0) return null;
  const label = formatAssignedTeachersLabel(student.assignedTeachers);
  return hasAssignedTeacher(label) ? `Lead teacher · ${label}` : 'No lead teacher yet';
}

/**
 * Roster row: photo (health badge), name, grade / program / "Needs assignment"
 * chips, lead-teacher caption, and a separate 44pt classroom chip that opens
 * the assign sheet. Labels match the Story row ("{name}",
 * "Assign classrooms. {classrooms}").
 */
export const StudentRow = memo(function StudentRow({
  student,
  onPress,
  onPressClassroom,
  saving = false,
  flash = false,
}: {
  student: AdminEnrolledStudentSummary;
  onPress: (student: AdminEnrolledStudentSummary) => void;
  onPressClassroom: (student: AdminEnrolledStudentSummary) => void;
  saving?: boolean;
  flash?: boolean;
}) {
  const accent = useGardenAccent();
  const name = formatEnrolledStudentName(student);
  const grade = formatStudentGrade(student.grade);
  const program = student.programNames[0] ?? null;
  const unassigned = isStudentUnassigned(student);
  const noClassroom = student.classroomNames.length === 0;
  const classroomLabel = formatStudentClassroomLabel(student.classroomNames);
  const caption = leadTeacherCaption(student);

  return (
    <View style={[styles.card, flash && styles.flash]}>
      <GPressable
        accessibilityLabel={name}
        accessibilityHint="Opens the student record"
        pressedScale={0.985}
        onPress={() => onPress(student)}
        style={styles.main}>
        <StudentPhoto
          name={name}
          photoUrl={student.profilePhotoUrl}
          size="row"
          showHealthIndicator={student.hasStandingHealthItems}
        />
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.chips}>
            {grade ? <GChip label={grade} tone="info" /> : null}
            {program ? <GChip label={program} tone="success" /> : null}
            {unassigned ? <GChip label="Needs assignment" tone="warning" icon="alert-circle" /> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </GPressable>

      <View style={styles.foot}>
        <GPressable
          accessibilityLabel={`Assign classrooms. ${classroomLabel}`}
          accessibilityState={{ busy: saving }}
          haptic="select"
          onPress={() => onPressClassroom(student)}
          style={[
            styles.classroom,
            noClassroom
              ? { borderColor: '#E2B33C', backgroundColor: '#FFF6DA' }
              : { borderColor: Garden.ink12, backgroundColor: Garden.paper },
          ]}>
          {saving ? (
            <ActivityIndicator size="small" color={accent.clayDeep} />
          ) : (
            <Ionicons
              name={noClassroom ? 'add-circle-outline' : 'easel-outline'}
              size={16}
              color={noClassroom ? '#6B4F00' : Garden.ink65}
            />
          )}
          <Text
            style={[styles.classroomLabel, noClassroom && styles.classroomLabelEmpty]}
            numberOfLines={1}>
            {noClassroom ? 'Assign classroom' : classroomLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color={noClassroom ? '#6B4F00' : Garden.ink60} />
        </GPressable>
        {caption ? (
          <Text style={styles.caption} numberOfLines={1} accessibilityLabel={caption}>
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    padding: 12,
    gap: 10,
  },
  flash: { backgroundColor: Garden.mint, borderColor: Garden.forest },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  copy: { flex: 1, minWidth: 0, gap: 6 },
  name: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, lineHeight: 21, color: Garden.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Garden.ink06,
  },
  classroom: {
    flexShrink: 1,
    minHeight: 44,
    maxWidth: '62%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  classroomLabel: { flexShrink: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 13.5, color: Garden.ink },
  classroomLabelEmpty: { color: '#6B4F00' },
  caption: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
