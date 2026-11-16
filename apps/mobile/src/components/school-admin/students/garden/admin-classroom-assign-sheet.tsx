import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GLink, GOutlineButton, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { haptic } from '@/lib/haptics';
import {
  buildAssignableClassroomPickerGroups,
  getAssignableClassrooms,
} from '@/lib/school-admin/assignable-classrooms';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import { haveSameIds, requestCloseIfClean } from '@/lib/unsaved-changes';

type PickerRow =
  | { key: string; type: 'header'; programLabel: string }
  | { key: string; type: 'classroom'; classroom: ClassroomSummary };

export type ClassroomSheetNotice = { tone: 'error' | 'info'; title: string; description?: string };

/**
 * Garden "Assign classrooms" sheet. Same behaviour as the Story
 * `StudentClassroomAssignPicker` (program groups, search, checkbox rows,
 * dirty-only Save, discard confirm, "Add a classroom") on the same
 * `BottomSheetShell scrollable={false}` path. Save resolves `true` when it
 * saved; failures stay in the sheet as a banner (toasts sit behind modals).
 */
export function AdminClassroomAssignSheet({
  visible,
  studentName,
  studentProgramNames,
  studentProgramIds,
  classroomIds,
  classrooms,
  loading = false,
  saving = false,
  notice = null,
  loadError = null,
  onRetryLoad,
  onClose,
  onSave,
  onAddClassroom,
}: {
  visible: boolean;
  studentName: string;
  studentProgramNames: string[];
  studentProgramIds: string[];
  classroomIds: string[];
  classrooms: ClassroomSummary[];
  loading?: boolean;
  saving?: boolean;
  notice?: ClassroomSheetNotice | null;
  /** Classrooms failed to load: show it with Try again instead of "No classrooms yet". */
  loadError?: string | null;
  onRetryLoad?: () => void;
  onClose: () => void;
  onSave: (classroomIds: string[]) => Promise<boolean>;
  onAddClassroom?: () => void;
}) {
  const accent = useGardenAccent();
  const [selectedIds, setSelectedIds] = useState<string[]>(classroomIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [openedWith, setOpenedWith] = useState<{ visible: boolean; ids: string[] }>({
    visible,
    ids: classroomIds,
  });

  // Reset the selection each time the sheet opens (previous-value pattern, no effect).
  if (openedWith.visible !== visible || (visible && !haveSameIds(openedWith.ids, classroomIds))) {
    setOpenedWith({ visible, ids: classroomIds });
    if (visible) {
      setSelectedIds(classroomIds);
      setSearchQuery('');
    }
  }

  const assignableClassrooms = useMemo(
    () => getAssignableClassrooms(classrooms, studentProgramIds, studentProgramNames),
    [classrooms, studentProgramIds, studentProgramNames],
  );

  const groupedClassrooms = useMemo(
    () => buildAssignableClassroomPickerGroups(classrooms, studentProgramIds, studentProgramNames),
    [classrooms, studentProgramIds, studentProgramNames],
  );

  const rows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const result: PickerRow[] = [];
    for (const group of groupedClassrooms) {
      const filtered = group.classrooms.filter((classroom) => {
        if (!normalized) return true;
        const haystack = [classroom.name, classroom.programName ?? '', classroom.leadTeacherNames.join(' ')]
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
    haptic.select();
    setSelectedIds((current) =>
      current.includes(classroomId) ? current.filter((id) => id !== classroomId) : [...current, classroomId],
    );
  };

  const isDirty = useMemo(() => !haveSameIds(selectedIds, classroomIds), [selectedIds, classroomIds]);

  const requestClose = useCallback(() => {
    if (saving) return;
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose, saving]);

  const canSave = isDirty && !loading && !loadError && classrooms.length > 0;
  const showTrueEmpty = !loading && !loadError && classrooms.length === 0;
  const showNoAssignable = !loading && classrooms.length > 0 && assignableClassrooms.length === 0;
  const selectedCount = selectedIds.length;

  const statusLine = saving
    ? 'Saving classrooms…'
    : isDirty
      ? `${selectedCount} selected · not saved yet`
      : selectedCount > 0
        ? `${selectedCount} classroom${selectedCount === 1 ? '' : 's'} assigned`
        : 'No classroom yet';

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      scrollable={false}
      keyboardShouldPersistTaps="handled"
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="88%"
      enableDragToDismiss={!isDirty && !saving}
      sheetStyle={styles.sheet}
      header={
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              Assign classrooms
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {studentName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {isDirty ? <GChip label="Changed" tone="warning" /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={6}
              onPress={() => {
                haptic.tap();
                requestClose();
              }}
              style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
              <Ionicons name="close" size={20} color={Garden.ink} />
            </Pressable>
          </View>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerStatus} accessibilityLiveRegion="polite">
            {statusLine}
          </Text>
          <View style={styles.footerButtons}>
            <GOutlineButton label="Cancel" onPress={requestClose} />
            <GToyButton
              label={saving ? 'Saving…' : 'Save'}
              icon="checkmark"
              loading={saving}
              disabled={!canSave}
              onPress={() => void onSave(selectedIds)}
            />
          </View>
        </View>
      }>
      {notice ? (
        <GInlineBanner tone={notice.tone} title={notice.title} description={notice.description} />
      ) : null}
      {loadError && !loading ? (
        <GInlineBanner
          tone="error"
          title="Couldn't load classrooms"
          description={loadError}
          action={onRetryLoad ? <GLink label="Try again" icon="refresh" onPress={onRetryLoad} /> : undefined}
        />
      ) : loading ? (
        <View style={styles.skeletonList} accessibilityLabel="Loading classrooms">
          {Array.from({ length: 5 }, (_, index) => (
            <GSkeleton key={index} style={styles.skeletonOption} />
          ))}
        </View>
      ) : showTrueEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="easel-outline" size={24} color={Garden.soft} />
          <Text style={styles.emptyCopy}>No classrooms yet.</Text>
          {onAddClassroom ? <GLink label="Add a classroom" onPress={onAddClassroom} /> : null}
        </View>
      ) : (
        <>
          <Text style={styles.helper}>
            Select all classrooms for this student. Org-wide classrooms can be used for any program.
          </Text>
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={Garden.soft} />
            <TextInput
              accessibilityLabel="Search classrooms"
              placeholder="Search classrooms or teachers…"
              placeholderTextColor={Garden.soft}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>
          {showNoAssignable ? (
            <Text style={styles.emptyCopy}>No classrooms available for this student&apos;s programs.</Text>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.key}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return <GKicker style={styles.groupLabel}>{item.programLabel}</GKicker>;
                }
                const classroom = item.classroom;
                const selected = selectedIds.includes(classroom.id);
                const teacherLine = classroom.leadTeacherNames.join(', ') || 'No lead teacher';
                return (
                  <GPressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={`${classroom.name}. ${teacherLine}`}
                    accessibilityState={{ checked: selected, disabled: saving }}
                    disabled={saving}
                    haptic="none"
                    pressedScale={0.985}
                    onPress={() => toggleClassroom(classroom.id)}
                    style={[
                      styles.option,
                      selected
                        ? { borderColor: accent.clay, backgroundColor: accent.wash }
                        : { borderColor: Garden.ink12, backgroundColor: Garden.white },
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionTitle}>{classroom.name}</Text>
                      <Text style={styles.optionMeta}>{teacherLine}</Text>
                    </View>
                    <View
                      style={[
                        styles.check,
                        selected
                          ? { backgroundColor: accent.clay, borderColor: accent.clay }
                          : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
                      ]}>
                      {selected ? <Ionicons name="checkmark" size={15} color={Garden.white} /> : null}
                    </View>
                  </GPressable>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyCopy}>No classrooms match your search.</Text>}
            />
          )}
        </>
      )}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 16, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontFamily: GardenFonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.6, color: Garden.ink },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { transform: [{ scale: 0.95 }] },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 16, color: Garden.ink, paddingVertical: 10 },
  list: { flex: 1 },
  groupLabel: { marginTop: 10, marginBottom: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  optionCopy: { flex: 1, gap: 2 },
  optionTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  optionMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonList: { gap: 8 },
  skeletonOption: { height: 56, borderRadius: 16 },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
  footerStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  footerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
});
