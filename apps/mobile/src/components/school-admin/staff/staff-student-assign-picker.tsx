import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { getSupabaseClient } from '@/lib/supabase';

type StaffStudentAssignPickerProps = {
  visible: boolean;
  staffMemberName: string;
  organizationId: string;
  assignedStudentIds: string[];
  assigning?: boolean;
  onClose: () => void;
  onAssign: (studentId: string) => Promise<void>;
};

type PickerOption = {
  id: string;
  label: string;
  subtitle: string | null;
};

export function StaffStudentAssignPicker({
  visible,
  staffMemberName,
  organizationId,
  assignedStudentIds,
  assigning = false,
  onClose,
  onAssign,
}: StaffStudentAssignPickerProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  const [enrolledStudents, setEnrolledStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const supabase = getSupabaseClient();
        const rows = await listOrgEnrolledStudents(supabase, organizationId, {
          limit: 500,
        });
        if (!cancelled) {
          setEnrolledStudents(rows);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, visible]);

  const options = useMemo<PickerOption[]>(() => {
    const assignedSet = new Set(assignedStudentIds);
    return enrolledStudents
      .filter((student) => !assignedSet.has(student.id))
      .sort((a, b) =>
        formatEnrolledStudentName(a).localeCompare(formatEnrolledStudentName(b)),
      )
      .map((student) => ({
        id: student.id,
        label: formatEnrolledStudentName(student),
        subtitle: student.assignedTeacherName
          ? `Currently: ${student.assignedTeacherName}`
          : formatStudentGrade(student.grade),
      }));
  }, [assignedStudentIds, enrolledStudents]);

  const handleSelect = async (studentId: string) => {
    if (assigning) return;
    await onAssign(studentId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close student picker"
        />
        <Animated.View
          entering={SlideInDown.duration(280)}
          exiting={SlideOutDown.duration(220)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              Assign student
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {staffMemberName}
            </ThemedText>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : options.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                All enrolled students are already assigned to this staff member.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={assigning}
                  onPress={() => void handleSelect(item.id)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && { backgroundColor: theme.elevated },
                  ]}>
                  <View style={styles.optionText}>
                    <ThemedText type="small" style={{ color: theme.textPrimary }}>
                      {item.label}
                    </ThemedText>
                    {item.subtitle ? (
                      <ThemedText type="small" style={{ color: theme.textTertiary }}>
                        {item.subtitle}
                      </ThemedText>
                    ) : null}
                  </View>
                  {assigning ? (
                    <ActivityIndicator color={theme.accent} size="small" />
                  ) : (
                    <Ionicons name="add" size={18} color={theme.accent} />
                  )}
                </Pressable>
              )}
            />
          )}

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelButton,
              { borderColor: theme.border, backgroundColor: theme.bg },
              pressed && { opacity: 0.85 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
              Cancel
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '70%',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  cancelButton: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
