import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';
import {
  formatStaffMemberName,
  type OrgStaffMemberRecord,
} from '@/lib/school-admin/enrolled-students';
import { haveSameIds, requestCloseIfClean } from '@/lib/unsaved-changes';

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

  const isDirty = useMemo(
    () => !haveSameIds(selectedIds, assignedTeacherIds),
    [selectedIds, assignedTeacherIds],
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handleSave = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const canSave = isDirty;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      scrollable={false}
      backgroundColor={theme.surface}
      borderColor={theme.border}
      handleColor={theme.borderStrong}
      maxHeight="70%"
      header={
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Assign teachers
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {studentName}
          </ThemedText>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={requestClose}
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
            disabled={saving || !canSave}
            style={({ pressed }) => [
              styles.footerButton,
              styles.saveButton,
              {
                backgroundColor: theme.accent,
                opacity: pressed && canSave && !saving ? 0.85 : canSave && !saving ? 1 : DISABLED_BUTTON_OPACITY,
              },
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
      }>
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
          style={styles.list}
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
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    maxHeight: 360,
  },
  emptyState: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
