import { useMemo } from 'react';
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
import { formatStaffMemberName, type OrgStaffMemberRecord } from '@/lib/school-admin/enrolled-students';

type StudentTeacherAssignPickerProps = {
  visible: boolean;
  studentName: string;
  assignedTeacherId: string | null;
  activeStaff: OrgStaffMemberRecord[];
  assigning?: boolean;
  onClose: () => void;
  onAssign: (staffMemberId: string | null) => Promise<void>;
};

type PickerOption = {
  id: string | null;
  label: string;
};

export function StudentTeacherAssignPicker({
  visible,
  studentName,
  assignedTeacherId,
  activeStaff,
  assigning = false,
  onClose,
  onAssign,
}: StudentTeacherAssignPickerProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  const options = useMemo<PickerOption[]>(() => {
    const sorted = [...activeStaff].sort((a, b) =>
      formatStaffMemberName(a).localeCompare(formatStaffMemberName(b)),
    );
    return [
      { id: null, label: 'Unassigned' },
      ...sorted.map((member) => ({
        id: member.id,
        label: formatStaffMemberName(member),
      })),
    ];
  }, [activeStaff]);

  const handleSelect = async (staffMemberId: string | null) => {
    if (assigning || staffMemberId === assignedTeacherId) {
      onClose();
      return;
    }
    await onAssign(staffMemberId);
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
              Assign teacher
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
              keyExtractor={(item) => item.id ?? 'unassigned'}
              renderItem={({ item }) => {
                const selected = item.id === assignedTeacherId;
                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={assigning}
                    onPress={() => void handleSelect(item.id)}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && { backgroundColor: theme.elevated },
                      selected && { backgroundColor: theme.accentLight },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ color: selected ? theme.accent : theme.textPrimary, flex: 1 }}>
                      {item.label}
                    </ThemedText>
                    {selected ? (
                      assigning ? (
                        <ActivityIndicator color={theme.accent} size="small" />
                      ) : (
                        <Ionicons name="checkmark" size={18} color={theme.accent} />
                      )
                    ) : null}
                  </Pressable>
                );
              }}
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
    ...StyleSheet.absoluteFill,
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
  cancelButton: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
