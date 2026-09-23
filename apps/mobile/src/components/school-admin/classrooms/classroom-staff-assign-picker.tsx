import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomStaffRole } from '@/lib/school-admin/classrooms';
import type { StaffMemberRecord } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { requestCloseIfClean } from '@/lib/unsaved-changes';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';

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

  const isDirty = selectedStaffId !== null;

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handleSave = async () => {
    if (!selectedStaffId) return;
    await onSave(selectedStaffId, role);
    onClose();
  };

  const canSave = selectedStaffId !== null;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      scrollable={false}
      keyboardShouldPersistTaps="handled"
      backgroundColor={theme.white}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="88%"
      sheetStyle={styles.sheet}
      header={
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.ink }]}>Assign staff</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>{classroomName}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={requestClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.muted} />
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" disabled={saving} onPress={requestClose}>
            <Text style={{ color: theme.muted }}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving || !canSave}
            onPress={() => void handleSave()}
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.primary,
                opacity: canSave && !saving ? 1 : DISABLED_BUTTON_OPACITY,
              },
            ]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveLabel}>Assign</Text>}
          </Pressable>
        </View>
      }>
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
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
  saveButton: {
    borderRadius: Radius.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: 'center',
  },
  saveLabel: { fontFamily: StoryFonts.bodySemiBold, color: '#fff' },
});
