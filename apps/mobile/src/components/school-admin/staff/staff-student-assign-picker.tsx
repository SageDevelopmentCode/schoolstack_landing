import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { StoryButton } from '@/components/story/story-button';
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
  const insets = useSafeAreaInsets();

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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={requestClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={requestClose}
          accessibilityLabel="Close student picker"
        />
        <Animated.View
          entering={SlideInDown.duration(280)}
          exiting={SlideOutDown.duration(220)}
          style={[
            styles.sheet,
            {
              backgroundColor: Story.paper,
              borderColor: Story.line,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          <View style={[styles.header, { borderBottomColor: Story.line }]}>
            <Text style={[styles.headerTitle, { color: theme.ink }]}>Assign students</Text>
            <Text style={[styles.headerSubtitle, { color: theme.muted }]}>{staffMemberName}</Text>
          </View>

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
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                {searchQuery.trim()
                  ? 'No students match your search.'
                  : 'All enrolled students are already assigned to this staff member.'}
              </Text>
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
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: selected ? theme.primary : theme.ink },
                        ]}>
                        {item.label}
                      </Text>
                      {item.subtitle ? (
                        <Text style={[styles.optionSubtitle, { color: theme.muted }]}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}

          <View style={styles.footer}>
            <StoryButton label="Cancel" variant="outline" onPress={requestClose} disabled={saving} />
            <StoryButton
              label={selectedIds.length > 0 ? `Assign (${selectedIds.length})` : 'Assign'}
              disabled={saving || !canSave}
              onPress={() => void handleSave()}
              style={!canSave || saving ? { opacity: DISABLED_BUTTON_OPACITY } : undefined}
            />
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    maxHeight: '75%',
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    gap: 2,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
  headerSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
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
  emptyState: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  optionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
});
