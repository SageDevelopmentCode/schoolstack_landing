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
  staffMemberId: string;
  organizationId: string;
  assignedStudentIds: string[];
  saving?: boolean;
  onClose: () => void;
  onSave: (studentIds: string[]) => Promise<void>;
};

type PickerOption = {
  id: string;
  label: string;
  subtitle: string | null;
};

export function StaffStudentAssignPicker({
  visible,
  staffMemberName,
  staffMemberId,
  organizationId,
  assignedStudentIds,
  saving = false,
  onClose,
  onSave,
}: StaffStudentAssignPickerProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  const [enrolledStudents, setEnrolledStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setSelectedIds([]);
  }, [visible]);

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
      .map((student) => {
        const otherTeachers = student.assignedTeachers
          .filter((teacher) => teacher.id !== staffMemberId)
          .map((teacher) => teacher.name);

        return {
          id: student.id,
          label: formatEnrolledStudentName(student),
          subtitle:
            otherTeachers.length > 0
              ? `Teachers: ${otherTeachers.join(', ')}`
              : formatStudentGrade(student.grade),
        };
      });
  }, [assignedStudentIds, enrolledStudents, staffMemberId]);

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    await onSave(selectedIds);
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
              Assign students
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
              renderItem={({ item }) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    disabled={saving}
                    onPress={() => toggleStudent(item.id)}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && { backgroundColor: theme.elevated },
                      selected && { backgroundColor: theme.accentLight },
                    ]}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selected ? theme.accent : theme.borderStrong,
                          backgroundColor: selected ? theme.accent : theme.elevated,
                        },
                      ]}>
                      {selected ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <View style={styles.optionText}>
                      <ThemedText
                        type="small"
                        style={{ color: selected ? theme.accent : theme.textPrimary }}>
                        {item.label}
                      </ThemedText>
                      {item.subtitle ? (
                        <ThemedText type="small" style={{ color: theme.textTertiary }}>
                          {item.subtitle}
                        </ThemedText>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              disabled={saving}
              style={({ pressed }) => [
                styles.footerButton,
                styles.cancelButton,
                { borderColor: theme.border, backgroundColor: theme.bg },
                pressed && { opacity: 0.85 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleSave()}
              disabled={saving || selectedIds.length === 0}
              style={({ pressed }) => [
                styles.footerButton,
                styles.saveButton,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.85 },
                (saving || selectedIds.length === 0) && { opacity: 0.6 },
              ]}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  Assign{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </ThemedText>
              )}
            </Pressable>
          </View>
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
  },
  cancelButton: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {},
});
