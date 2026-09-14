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
  type ViewStyle,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  buildAssignableClassroomPickerGroups,
  getAssignableClassrooms,
} from '@/lib/school-admin/assignable-classrooms';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import { haveSameIds, requestCloseIfClean } from '@/lib/unsaved-changes';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';

type StudentClassroomAssignPickerProps = {
  visible: boolean;
  studentName: string;
  studentProgramNames: string[];
  studentProgramIds: string[];
  classroomIds: string[];
  classrooms: ClassroomSummary[];
  loading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (classroomIds: string[]) => Promise<void>;
  onAddClassroom?: () => void;
};

type PickerRow = {
  key: string;
  type: 'header' | 'classroom';
  programLabel?: string;
  classroom?: ClassroomSummary;
};

function SkeletonBlock({
  style,
  backgroundColor,
}: {
  style: ViewStyle;
  backgroundColor: string;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

function ClassroomPickerSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonBlock
          key={index}
          style={styles.skeletonOption}
          backgroundColor={backgroundColor}
        />
      ))}
    </View>
  );
}

export function StudentClassroomAssignPicker({
  visible,
  studentName,
  studentProgramNames,
  studentProgramIds,
  classroomIds,
  classrooms,
  loading = false,
  saving = false,
  onClose,
  onSave,
  onAddClassroom,
}: StudentClassroomAssignPickerProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelectedIds(classroomIds);
    setSearchQuery('');
  }, [visible, classroomIds]);

  const assignableClassrooms = useMemo(
    () => getAssignableClassrooms(classrooms, studentProgramIds, studentProgramNames),
    [classrooms, studentProgramIds, studentProgramNames],
  );

  const groupedClassrooms = useMemo(
    () =>
      buildAssignableClassroomPickerGroups(
        classrooms,
        studentProgramIds,
        studentProgramNames,
      ),
    [classrooms, studentProgramIds, studentProgramNames],
  );

  const rows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const result: PickerRow[] = [];

    for (const group of groupedClassrooms) {
      const filtered = group.classrooms.filter((classroom) => {
        if (!normalized) return true;
        const haystack = [
          classroom.name,
          classroom.programName ?? '',
          classroom.leadTeacherNames.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      });

      if (filtered.length === 0) continue;
      result.push({ key: `header-${group.programLabel}`, type: 'header', programLabel: group.programLabel });
      for (const classroom of filtered) {
        result.push({ key: classroom.id, type: 'classroom', classroom });
      }
    }

    return result;
  }, [groupedClassrooms, searchQuery]);

  const toggleClassroom = (classroomId: string) => {
    setSelectedIds((current) =>
      current.includes(classroomId)
        ? current.filter((id) => id !== classroomId)
        : [...current, classroomId],
    );
  };

  const isDirty = useMemo(
    () => !haveSameIds(selectedIds, classroomIds),
    [selectedIds, classroomIds],
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handleSave = async () => {
    await onSave(selectedIds);
    onClose();
  };

  const canSave = isDirty && !loading && classrooms.length > 0;
  const skeletonColor = '#E4E8E1';
  const showTrueEmpty = !loading && classrooms.length === 0;
  const showNoAssignable = !loading && classrooms.length > 0 && assignableClassrooms.length === 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={requestClose}>
      <Pressable style={styles.overlay} onPress={requestClose}>
        <Animated.View
          entering={SlideInDown.duration(260)}
          exiting={SlideOutDown.duration(220)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.white,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: theme.ink }]}>Assign classrooms</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>{studentName}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={requestClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.muted} />
              </Pressable>
            </View>

            {loading ? (
              <ClassroomPickerSkeleton backgroundColor={skeletonColor} />
            ) : showTrueEmpty ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyCopy, { color: theme.muted }]}>No classrooms yet.</Text>
                {onAddClassroom ? (
                  <Pressable accessibilityRole="button" onPress={onAddClassroom}>
                    <Text style={[styles.link, { color: theme.primary }]}>Add a classroom →</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <>
                <Text style={[styles.helper, { color: theme.muted }]}>
                  Select all classrooms for this student. Org-wide classrooms can be used for any
                  program.
                </Text>

                <View
                  style={[
                    styles.searchField,
                    { backgroundColor: Story.paper, borderColor: Story.line },
                  ]}>
                  <Ionicons name="search" size={16} color={theme.muted} />
                  <TextInput
                    accessibilityLabel="Search classrooms"
                    placeholder="Search classrooms or teachers…"
                    placeholderTextColor={theme.muted}
                    style={[styles.searchInput, { color: theme.ink }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {showNoAssignable ? (
                  <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                    No classrooms available for this student's programs.
                  </Text>
                ) : (
                  <FlatList
                    data={rows}
                    keyExtractor={(item) => item.key}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                      if (item.type === 'header') {
                        return (
                          <Text style={[styles.groupLabel, { color: theme.muted }]}>
                            {item.programLabel}
                          </Text>
                        );
                      }

                      const classroom = item.classroom!;
                      const selected = selectedIds.includes(classroom.id);
                      const teacherLine = classroom.leadTeacherNames.join(', ') || 'No lead teacher';

                      return (
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                          disabled={saving}
                          onPress={() => toggleClassroom(classroom.id)}
                          style={[
                            styles.option,
                            {
                              borderColor: selected ? '#BCD4C1' : Story.line,
                              backgroundColor: selected ? '#E9F2EA' : theme.white,
                            },
                          ]}>
                          <View style={styles.optionCopy}>
                            <Text style={[styles.optionTitle, { color: theme.ink }]}>
                              {classroom.name}
                            </Text>
                            <Text style={[styles.optionMeta, { color: theme.muted }]}>
                              {teacherLine}
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
                      <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                        No classrooms match your search.
                      </Text>
                    }
                  />
                )}
              </>
            )}

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={requestClose}
                style={styles.footerButton}>
                <Text style={[styles.cancelLabel, { color: theme.muted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!canSave || saving}
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
                  <Text style={styles.saveLabel}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(40, 57, 67, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  helper: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 15,
    padding: 0,
  },
  list: {
    maxHeight: 360,
  },
  skeletonList: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  skeletonOption: {
    height: 56,
    borderRadius: 12,
  },
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  optionMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  footerButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  saveButton: {
    borderRadius: Radius.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: 'center',
  },
  saveLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
  },
});
