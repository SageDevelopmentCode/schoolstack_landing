import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomStaffRole } from '@/lib/school-admin/classrooms';
import type { StaffMemberRecord } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

type ClassroomStaffAssignPickerProps = {
  visible: boolean;
  classroomName: string;
  staffMembers: StaffMemberRecord[];
  assignedStaffIds: string[];
  saving?: boolean;
  onClose: () => void;
  onSave: (staffMemberId: string, role: ClassroomStaffRole) => Promise<void>;
};

export function ClassroomStaffAssignPicker({
  visible,
  classroomName,
  staffMembers,
  assignedStaffIds,
  saving = false,
  onClose,
  onSave,
}: ClassroomStaffAssignPickerProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [role, setRole] = useState<ClassroomStaffRole>('lead');

  useEffect(() => {
    if (!visible) return;
    setSearchQuery('');
    setSelectedStaffId(null);
    setRole('lead');
  }, [visible]);

  const options = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return staffMembers
      .filter((member) => member.employmentStatus === 'active')
      .filter((member) => !assignedStaffIds.includes(member.id))
      .filter((member) => {
        if (!normalized) return true;
        const haystack = [member.firstName, member.lastName, member.email ?? '', member.roleTitle ?? '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      );
  }, [assignedStaffIds, searchQuery, staffMembers]);

  const handleSave = async () => {
    if (!selectedStaffId) return;
    await onSave(selectedStaffId, role);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.duration(260)}
          exiting={SlideOutDown.duration(220)}
          style={[
            styles.sheet,
            { backgroundColor: theme.white, paddingBottom: Math.max(insets.bottom, Spacing.three) },
          ]}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.ink }]}>Assign staff</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>{classroomName}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.muted} />
              </Pressable>
            </View>

            <View style={styles.roleRow}>
              {(['lead', 'assistant'] as ClassroomStaffRole[]).map((option) => {
                const active = role === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => setRole(option)}
                    style={[
                      styles.rolePill,
                      {
                        backgroundColor: active ? '#E9F2EA' : Story.paper,
                        borderColor: active ? '#BCD4C1' : Story.line,
                      },
                    ]}>
                    <Text style={{ color: active ? theme.primary : theme.muted }}>
                      {option === 'lead' ? 'Lead teacher' : 'Assistant'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.searchField, { borderColor: Story.line, backgroundColor: Story.paper }]}>
              <Ionicons name="search" size={16} color={theme.muted} />
              <TextInput
                placeholder="Search staff"
                placeholderTextColor={theme.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.ink }]}
              />
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = selectedStaffId === item.id;
                const name = `${item.firstName} ${item.lastName}`.trim();
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedStaffId(item.id)}
                    style={[
                      styles.option,
                      {
                        borderColor: selected ? '#BCD4C1' : Story.line,
                        backgroundColor: selected ? '#E9F2EA' : theme.white,
                      },
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionTitle, { color: theme.ink }]}>{name}</Text>
                      <Text style={[styles.optionMeta, { color: theme.muted }]}>
                        {item.roleTitle ?? 'Staff'}
                      </Text>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? theme.primary : theme.muted}
                    />
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.emptyCopy, { color: theme.muted }]}>No staff available.</Text>
              }
            />

            <View style={styles.footer}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={onClose}>
                <Text style={{ color: theme.muted }}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving || !selectedStaffId}
                onPress={() => void handleSave()}
                style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveLabel}>Assign</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(40, 57, 67, 0.45)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.three },
  title: { fontFamily: StoryFonts.display, fontSize: 22 },
  subtitle: { fontFamily: StoryFonts.body, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  rolePill: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    marginBottom: Spacing.two,
  },
  searchInput: { flex: 1, fontFamily: StoryFonts.body, fontSize: 15, padding: 0 },
  list: { maxHeight: 320 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  optionCopy: { flex: 1 },
  optionTitle: { fontFamily: StoryFonts.bodySemiBold, fontSize: 15 },
  optionMeta: { fontFamily: StoryFonts.body, fontSize: 12 },
  emptyCopy: { fontFamily: StoryFonts.body, fontSize: 14, paddingVertical: Spacing.two },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two, paddingTop: Spacing.two },
  saveButton: { borderRadius: Radius.md, paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: 12, minWidth: 88, alignItems: 'center' },
  saveLabel: { fontFamily: StoryFonts.bodySemiBold, color: '#fff' },
});
