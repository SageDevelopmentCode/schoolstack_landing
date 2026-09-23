import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { ThemedText } from '@/components/themed-text';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { getSupabaseClient } from '@/lib/supabase';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

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
  const theme = useParentTheme();

  const [enrolledStudents, setEnrolledStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelectedIds([]);
    setSearchQuery('');
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
    const normalized = searchQuery.trim().toLowerCase();

    return enrolledStudents
      .filter((student) => !assignedSet.has(student.id))
      .filter((student) => {
        if (!normalized) return true;
        const haystack = [
          formatEnrolledStudentName(student),
          formatStudentGrade(student.grade) ?? '',
          student.programNames.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      })
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
  }, [assignedStudentIds, enrolledStudents, searchQuery, staffMemberId]);

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
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="75%"
      header={
        <View style={[styles.header, { borderBottomColor: Story.line }]}>
          <ThemedText type="smallBold" style={{ color: theme.ink }}>
            Assign students
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.muted }}>
            {staffMemberName}
          </ThemedText>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <StoryButton label="Cancel" variant="outline" onPress={requestClose} disabled={saving} />
          <StoryButton
            label={selectedIds.length > 0 ? `Assign (${selectedIds.length})` : 'Assign'}
            disabled={saving || !canSave}
            onPress={() => void handleSave()}
            style={!canSave || saving ? { opacity: DISABLED_BUTTON_OPACITY } : undefined}
          />
        </View>
      }>
      <View style={[styles.searchField, { backgroundColor: theme.white, borderColor: Story.line }]}>
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          accessibilityLabel="Search students"
          placeholder="Search students"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : options.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" style={{ color: theme.muted, textAlign: 'center' }}>
            {searchQuery.trim()
              ? 'No students match your search.'
              : 'All enrolled students are already assigned to this staff member.'}
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
                onPress={() => toggleStudent(item.id)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && { backgroundColor: Story.primarySoft },
                  selected && { backgroundColor: Story.primarySoft },
                ]}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: selected ? theme.primary : Story.line,
                      backgroundColor: selected ? theme.primary : theme.white,
                    },
                  ]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
                <View style={styles.optionText}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: selected ? theme.primary : theme.ink }}>
                    {item.label}
                  </ThemedText>
                  {item.subtitle ? (
                    <ThemedText type="small" style={{ color: theme.muted }}>
                      {item.subtitle}
                    </ThemedText>
                  ) : null}
                </View>
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
    borderBottomWidth: 1,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: StoryFonts.body,
    padding: 0,
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
  optionText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
});
