import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { AdminIconChip } from '@/components/school-admin/garden/admin-ui';
import type { ClassroomStatus, ClassroomSummary } from '@/lib/school-admin/classrooms';

export const CLASSROOM_STATUS_LABELS: Record<ClassroomStatus, string> = { open: 'Open', full: 'Full', inactive: 'Inactive' };

export function classroomStatusTone(status: ClassroomStatus): GChipTone {
  if (status === 'open') return 'success';
  if (status === 'full') return 'warning';
  return 'neutral';
}

const STATUS_TINTS: Record<ClassroomStatus, string> = { open: Garden.mint, full: Garden.butter, inactive: Garden.paper };

/** Classroom row: icon chip, name + status chip, counts / program, lead teachers (or a "No lead teacher" hint). */
export const ClassroomRow = memo(function ClassroomRow({
  classroom,
  onPress,
}: {
  classroom: ClassroomSummary;
  onPress: (classroom: ClassroomSummary) => void;
}) {
  const noLead = classroom.leadTeacherNames.length === 0;
  const counts = `${classroom.studentCount} student${classroom.studentCount === 1 ? '' : 's'} · ${classroom.staffCount} staff${
    classroom.programName ? ` · ${classroom.programName}` : ''
  }`;
  return (
    <GPressable
      accessibilityLabel={classroom.name}
      accessibilityHint="Opens the classroom"
      pressedScale={0.985}
      onPress={() => onPress(classroom)}
      style={styles.card}>
      <AdminIconChip name="easel-outline" tint={STATUS_TINTS[classroom.status]} size={44} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {classroom.name}
          </Text>
          <GChip label={CLASSROOM_STATUS_LABELS[classroom.status]} tone={classroomStatusTone(classroom.status)} />
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {counts}
        </Text>
        <View style={styles.teacherRow}>
          <Ionicons name={noLead ? 'alert-circle-outline' : 'person-outline'} size={13} color={noLead ? '#8A5A00' : Garden.soft} />
          <Text style={[styles.teacher, noLead && styles.teacherMissing]} numberOfLines={1}>
            {noLead ? 'No lead teacher' : classroom.leadTeacherNames.join(', ')}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    padding: 12,
    minHeight: 76,
  },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 16, lineHeight: 21, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft, fontVariant: ['tabular-nums'] },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  teacher: { flexShrink: 1, fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  teacherMissing: { color: '#8A5A00' },
});
