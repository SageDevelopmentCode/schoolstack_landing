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
  formatStaffMemberName,
  type OrgStaffMemberRecord,
} from '@/lib/school-admin/enrolled-students';

type StudentTeacherAssignPickerProps = {
  visible: boolean;
  studentName: string;
  assignedTeacherIds: string[];
  activeStaff: OrgStaffMemberRecord[];
  saving?: boolean;
  onClose: () => void;
  onSave: (staffMemberIds: string[]) => Promise<void>;
};

export function StudentTeacherAssignPicker({
  visible,
  studentName,
  assignedTeacherIds,
  activeStaff,
  saving = false,
  onClose,
  onSave,
}: StudentTeacherAssignPickerProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setSelectedIds(assignedTeacherIds);
  }, [visible, assignedTeacherIds]);

  const options = useMemo(() => {
    return [...activeStaff].sort((a, b) =>
      formatStaffMemberName(a).localeCompare(formatStaffMemberName(b)),
    );
  }, [activeStaff]);

  const toggleStaff = (staffMemberId: string) => {
    setSelectedIds((current) =>
      current.includes(staffMemberId)
        ? current.filter((id) => id !== staffMemberId)
        : [...current, staffMemberId],
    );
  };

  const handleSave = async () => {
    await onSave(selectedIds);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close teacher picker"
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
              Assign teachers
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {studentName}
            </ThemedText>
          </View>

          {activeStaff.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                No staff yet
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
                    onPress={() => toggleStaff(item.id)}
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
                    <ThemedText
                      type="small"
                      style={{ color: selected ? theme.accent : theme.textPrimary, flex: 1 }}>
                      {formatStaffMemberName(item)}
                    </ThemedText>
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
              disabled={saving}
              style={({ pressed }) => [
                styles.footerButton,
                styles.saveButton,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.6 },
              ]}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  Save
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
