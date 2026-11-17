import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Garden, GardenFonts, PANEL_TINTS } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { formatEnrolledStudentName, studentSubtitleLine } from '@/lib/teacher/teacher-home-utils';

/**
 * One face in a class photo: photo or initials on a pastel tile, the health
 * marker, first name and a short subtitle. The whole tile is the button.
 * Shared by Home › Your students and My Students.
 */
export function StudentFaceTile({
  student,
  index,
  onPress,
  meta,
  testID,
  style,
}: {
  student: AdminEnrolledStudentSummary;
  /** Picks the pastel. */
  index: number;
  onPress: (student: AdminEnrolledStudentSummary) => void;
  /** Extra line under the subtitle (e.g. "Teacher: Ms. Rivera"). */
  meta?: string | null;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const fullName = formatEnrolledStudentName(student);
  const first = student.firstName.trim() || fullName;
  const subtitle = studentSubtitleLine(student);

  return (
    <GPressable
      testID={testID}
      accessibilityLabel={`${fullName}. ${subtitle}${
        student.hasStandingHealthItems ? '. Has health notes' : ''
      }${meta ? `. ${meta}` : ''}. View profile`}
      pressedScale={0.96}
      onPress={() => onPress(student)}
      style={[styles.tile, { backgroundColor: PANEL_TINTS[index % PANEL_TINTS.length] }, style]}>
      <View style={styles.photo}>
        <StudentPhoto
          name={fullName}
          photoUrl={student.profilePhotoUrl}
          size="lg"
          showHealthIndicator={student.hasStandingHealthItems}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {first}
      </Text>
      {subtitle ? (
        <Text style={styles.meta} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      {meta ? (
        <Text style={styles.extra} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </GPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 6,
    borderRadius: 18,
    minHeight: 132,
  },
  photo: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: Garden.white,
    marginBottom: 2,
  },
  name: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 18,
    color: Garden.ink,
    textAlign: 'center',
  },
  meta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 11.5,
    lineHeight: 15,
    color: Garden.ink65,
    textAlign: 'center',
  },
  extra: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    color: Garden.ink65,
    textAlign: 'center',
  },
});
