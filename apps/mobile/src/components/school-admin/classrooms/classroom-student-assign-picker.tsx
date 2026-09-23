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
import { groupStudentsForClassroomPicker } from '@/lib/school-admin/classroom-roster-ui';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { Story, StoryFonts } from '@/constants/story-theme';
import { requestCloseIfClean } from '@/lib/unsaved-changes';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';

type ClassroomStudentAssignPickerProps = {
  visible: boolean;
  classroomName: string;
  classroomProgramName: string | null;
  students: AdminEnrolledStudentSummary[];
  assignedStudentIds: string[];
  saving?: boolean;
  onClose: () => void;
  onSave: (studentIds: string[]) => Promise<void>;
};

type PickerRow =
  | { key: string; type: 'header'; label: string }
  | { key: string; type: 'student'; student: AdminEnrolledStudentSummary };

export function ClassroomStudentAssignPicker({
  visible,
  classroomName,
  classroomProgramName,
  students,
  assignedStudentIds,
  saving = false,
  onClose,
  onSave,
}: ClassroomStudentAssignPickerProps) {
  const theme = useParentTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setSearchQuery('');
    setSelectedIds([]);
  }, [visible]);

  const rows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const available = students.filter((student) => !assignedStudentIds.includes(student.id));
    const filtered = available.filter((student) => {
      if (!normalized) return true;
      const haystack = [
        formatEnrolledStudentName(student),
        student.grade ?? '',
        formatStudentGrade(student.grade) ?? '',
        student.programNames.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });

    const groups = groupStudentsForClassroomPicker(filtered, classroomProgramName);
    const result: PickerRow[] = [];
    for (const group of groups) {
      if (group.label) {
        result.push({ key: `header-${group.label}`, type: 'header', label: group.label });
      }
      for (const student of group.students) {
        result.push({ key: student.id, type: 'student', student });
      }
    }
    return result;
  }, [assignedStudentIds, classroomProgramName, searchQuery, students]);

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const isDirty = selectedIds.length > 0;

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    await onSave(selectedIds);
    onClose();
  };

  const canSave = selectedIds.length > 0;

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
            <Text style={[styles.title, { color: theme.ink }]}>Add students</Text>
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
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveLabel}>Add {selectedIds.length || ''}</Text>
            )}
          </Pressable>
        </View>
      }>
      <View style={[styles.searchField, { borderColor: Story.line, backgroundColor: Story.paper }]}>
        <Ionicons name="search" size={16} color={theme.muted} />
        <TextInput
          placeholder="Search students"
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: theme.ink }]}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={[styles.groupLabel, { color: theme.muted }]}>{item.label}</Text>
            );
          }

          const student = item.student;
          const selected = selectedIds.includes(student.id);
          const name = formatEnrolledStudentName(student);
          const subtitle = [
            formatStudentGrade(student.grade),
            student.programNames[0],
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => toggleStudent(student.id)}
              style={[
                styles.option,
                {
                  borderColor: selected ? '#BCD4C1' : Story.line,
                  backgroundColor: selected ? '#E9F2EA' : theme.white,
                },
              ]}>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: theme.ink }]}>{name}</Text>
                {subtitle ? (
                  <Text style={[styles.optionMeta, { color: theme.muted }]}>{subtitle}</Text>
                ) : null}
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
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            No students available to add.
          </Text>
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
  groupLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
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
