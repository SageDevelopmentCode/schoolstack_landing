import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { SchoolAdminFridayBranchAddTimeSlotSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-add-time-slot-sheet';
import { SchoolAdminFridayBranchClassActionsSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-class-actions-sheet';
import { SchoolAdminFridayBranchClassDetailSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-class-detail-sheet';
import { SchoolAdminFridayBranchClassEditSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-class-edit-sheet';
import { SchoolAdminFridayBranchSendRosterSheet } from '@/components/school-admin/friday-branch/school-admin-friday-branch-send-roster-sheet';
import { SchoolAdminFridayBranchStatusTag } from '@/components/school-admin/friday-branch/school-admin-friday-branch-status-tag';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { fetchFridayBranchEnrollmentCounts } from '@/lib/school-admin/friday-branch/friday-branch-api';
import { mergeFridayBranchClassIntoBlock } from '@/lib/school-admin/friday-branch/friday-branch-class-save';
import type {
  FridayBranchBlock,
  FridayBranchClass,
  FridayBranchClassEnrollmentSummary,
} from '@/lib/school-admin/friday-branch/friday-branch-types';
import { formatFridayBranchPriceDisplay } from '@/lib/school-admin/friday-branch/friday-branch-price-utils';
import {
  createEmptyClass,
  createSlotWithTime,
  removeClassFromBlock,
  removeSlotFromBlock,
  sortFridayBranchTimeSlots,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchScheduleProps = {
  organizationId: string;
  block: FridayBranchBlock;
  saving?: boolean;
  highlightClassId?: string | null;
  requestedClassId?: string | null;
  addSlotOpen: boolean;
  onAddSlotOpenChange: (open: boolean) => void;
  onRequestedClassHandled?: () => void;
  onChange: (block: FridayBranchBlock) => void;
  onClassSaved?: (nextBlock: FridayBranchBlock) => Promise<void>;
};

type EditTarget = {
  slotId: string;
  classEntry: FridayBranchClass;
  isNew: boolean;
};

type DetailTarget = {
  classId: string;
  slotId: string;
  classEntry: FridayBranchClass;
  slotTime: string;
};

type SendRosterTarget = {
  classId: string;
  className: string;
  slotTime: string;
};

type ClassActionsTarget = {
  slotId: string;
  classEntry: FridayBranchClass;
  slotTime: string;
};

function collectBlockClassIds(block: FridayBranchBlock): string[] {
  const classIds: string[] = [];
  for (const slot of block.slots) {
    for (const classEntry of slot.classes) {
      classIds.push(classEntry.id);
    }
  }
  return classIds;
}

function findDetailTarget(block: FridayBranchBlock, classId: string): DetailTarget | null {
  for (const slot of block.slots) {
    const classEntry = slot.classes.find((entry) => entry.id === classId);
    if (!classEntry) continue;
    return {
      classId: classEntry.id,
      slotId: slot.id,
      classEntry,
      slotTime: slot.time,
    };
  }
  return null;
}

export function SchoolAdminFridayBranchSchedule({
  organizationId,
  block,
  saving = false,
  highlightClassId,
  requestedClassId,
  addSlotOpen,
  onAddSlotOpenChange,
  onRequestedClassHandled,
  onChange,
  onClassSaved,
}: SchoolAdminFridayBranchScheduleProps) {
  const theme = useParentTheme();
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [sendRosterTarget, setSendRosterTarget] = useState<SendRosterTarget | null>(null);
  const [classActionsTarget, setClassActionsTarget] = useState<ClassActionsTarget | null>(null);
  const [localHighlightClassId, setLocalHighlightClassId] = useState<string | null>(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState<
    Record<string, FridayBranchClassEnrollmentSummary>
  >({});

  const effectiveHighlightClassId = highlightClassId ?? localHighlightClassId;
  const sortedSlots = useMemo(() => sortFridayBranchTimeSlots(block.slots), [block.slots]);

  const requestedDetailTarget = useMemo(
    () => (requestedClassId ? findDetailTarget(block, requestedClassId) : null),
    [block, requestedClassId],
  );
  const activeDetailTarget = detailTarget ?? requestedDetailTarget;

  useEffect(() => {
    const activeClassIds = collectBlockClassIds(block);
    if (activeClassIds.length === 0) {
      setEnrollmentCounts({});
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const counts = await fetchFridayBranchEnrollmentCounts(organizationId, activeClassIds);
        if (!cancelled) {
          setEnrollmentCounts(counts);
        }
      } catch {
        if (!cancelled) {
          setEnrollmentCounts({});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [block, organizationId]);

  useEffect(() => {
    if (!requestedDetailTarget) return;
    onRequestedClassHandled?.();
  }, [onRequestedClassHandled, requestedDetailTarget]);

  const updateBlock = (nextBlock: FridayBranchBlock) => onChange(nextBlock);

  const handleSaveTimeSlot = async (payload: { time: string; firstClass?: Parameters<typeof createSlotWithTime>[1] }) => {
    const newSlot = createSlotWithTime(payload.time, payload.firstClass);
    const nextBlock = {
      ...block,
      slots: sortFridayBranchTimeSlots([...block.slots, newSlot]),
    };

    if (onClassSaved) {
      await onClassSaved(nextBlock);
    } else {
      updateBlock(nextBlock);
    }

    const classId = newSlot.classes[0]?.id;
    if (classId) {
      setLocalHighlightClassId(classId);
      setTimeout(() => setLocalHighlightClassId(null), 3000);
    }
  };

  const openEdit = (slotId: string, classEntry: FridayBranchClass, isNew = false) => {
    onAddSlotOpenChange(false);
    setDetailTarget(null);
    setEditTarget({ slotId, classEntry: { ...classEntry }, isNew });
  };

  const openDetail = (slotId: string, classEntry: FridayBranchClass, slotTime: string) => {
    setDetailTarget({
      classId: classEntry.id,
      slotId,
      classEntry,
      slotTime,
    });
  };

  const openAddClass = (slotId: string) => {
    openEdit(slotId, createEmptyClass(), true);
  };

  const handleEditFromDetail = (classEntry: FridayBranchClass) => {
    const slot = block.slots.find((entry) =>
      entry.classes.some((item) => item.id === classEntry.id),
    );
    if (!slot) return;
    setDetailTarget(null);
    openEdit(slot.id, classEntry);
  };

  const handleDeleteClass = (slotId: string, classId: string) => {
    Alert.alert('Remove class', 'Remove this class from the schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => updateBlock(removeClassFromBlock(block, slotId, classId)),
      },
    ]);
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert('Remove time slot', 'Remove this time slot and all classes in it?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => updateBlock(removeSlotFromBlock(block, slotId)),
      },
    ]);
  };

  const handleSaveClass = async (
    slotId: string,
    classEntry: FridayBranchClass,
    previousSlotId?: string,
  ) => {
    const nextBlock = mergeFridayBranchClassIntoBlock(block, slotId, classEntry, previousSlotId);
    if (onClassSaved) {
      await onClassSaved(nextBlock);
    } else {
      updateBlock(nextBlock);
    }
  };

  const openClassActions = (slotId: string, classEntry: FridayBranchClass, slotTime: string) => {
    setClassActionsTarget({ slotId, classEntry, slotTime });
  };

  return (
    <View style={styles.container}>
      {sortedSlots.length === 0 ? (
        <StoryCard compact style={styles.emptyCard}>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            Add a time slot to start building this block.
          </Text>
        </StoryCard>
      ) : (
        sortedSlots.map((slot) => (
          <View key={slot.id} style={styles.slotGroup}>
            <View style={styles.slotHeader}>
              <Text style={[styles.slotTime, { color: theme.ink }]}>{slot.time || 'Untitled time'}</Text>
              <Pressable accessibilityRole="button" onPress={() => handleDeleteSlot(slot.id)}>
                <Text style={[styles.slotAction, { color: theme.alert }]}>Remove slot</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.slotBacking,
                { backgroundColor: theme.white, borderColor: theme.line },
              ]}>
              {slot.classes.map((classEntry) => {
                const summary = enrollmentCounts[classEntry.id] ?? { confirmed: 0, waitlisted: 0 };
                const highlighted = effectiveHighlightClassId === classEntry.id;
                const capacityLabel =
                  classEntry.capacity && classEntry.capacity > 0
                    ? `${summary.confirmed} / ${classEntry.capacity}`
                    : String(summary.confirmed);
                const metaLine = [
                  classEntry.teacher || 'No leader',
                  formatFridayBranchPriceDisplay(classEntry.priceCents),
                  `${capacityLabel} signed up`,
                  summary.waitlisted > 0 ? `+${summary.waitlisted} waitlisted` : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Pressable
                    key={classEntry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${classEntry.name || 'Untitled class'} actions`}
                    onPress={() => openClassActions(slot.id, classEntry, slot.time)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                    <StoryCard
                      compact
                      style={
                        highlighted
                          ? { ...styles.classCard, borderColor: theme.primary, borderWidth: 2 }
                          : styles.classCard
                      }>
                      <View style={styles.classHeader}>
                        <View style={styles.classCopy}>
                          <Text style={[styles.className, { color: theme.ink }]}>
                            {classEntry.name || 'Untitled class'}
                          </Text>
                          <Text style={[styles.classMeta, { color: theme.muted }]}>{metaLine}</Text>
                        </View>
                        <Ionicons name="ellipsis-horizontal" size={18} color={theme.muted} />
                      </View>

                      <View style={styles.tagRow}>
                        {!classEntry.location.trim() ? (
                          <SchoolAdminFridayBranchStatusTag label="Needs location" variant="amber" />
                        ) : (
                          <Text style={[styles.inlineMeta, { color: theme.muted }]}>{classEntry.location}</Text>
                        )}
                        {!classEntry.ageGroup.trim() ? (
                          <SchoolAdminFridayBranchStatusTag label="Needs age group" variant="amber" />
                        ) : (
                          <Text style={[styles.inlineMeta, { color: theme.muted }]}>{classEntry.ageGroup}</Text>
                        )}
                        {classEntry.familyVisible === false ? (
                          <SchoolAdminFridayBranchStatusTag label="Hidden" variant="purple" />
                        ) : null}
                      </View>
                    </StoryCard>
                  </Pressable>
                );
              })}

              <StoryButton
                label="Add class"
                variant="outline"
                previewSafe
                disabled={saving}
                onPress={() => openAddClass(slot.id)}
              />
            </View>
          </View>
        ))
      )}

      <SchoolAdminFridayBranchAddTimeSlotSheet
        visible={addSlotOpen}
        slots={block.slots}
        saving={saving}
        onClose={() => onAddSlotOpenChange(false)}
        onSave={handleSaveTimeSlot}
      />

      <SchoolAdminFridayBranchClassEditSheet
        visible={Boolean(editTarget)}
        organizationId={organizationId}
        slots={block.slots}
        classEntry={editTarget?.classEntry ?? null}
        slotId={editTarget?.slotId ?? null}
        isNew={editTarget?.isNew ?? false}
        saving={saving}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveClass}
      />

      <SchoolAdminFridayBranchClassDetailSheet
        visible={Boolean(activeDetailTarget)}
        organizationId={organizationId}
        classId={activeDetailTarget?.classId ?? null}
        fallbackClass={activeDetailTarget?.classEntry ?? null}
        fallbackSlotTime={activeDetailTarget?.slotTime}
        onClose={() => setDetailTarget(null)}
        onEditClass={handleEditFromDetail}
      />

      <SchoolAdminFridayBranchSendRosterSheet
        visible={Boolean(sendRosterTarget)}
        organizationId={organizationId}
        classId={sendRosterTarget?.classId ?? null}
        className={sendRosterTarget?.className ?? ''}
        slotTime={sendRosterTarget?.slotTime ?? ''}
        onClose={() => setSendRosterTarget(null)}
      />

      <SchoolAdminFridayBranchClassActionsSheet
        visible={Boolean(classActionsTarget)}
        classEntry={classActionsTarget?.classEntry ?? null}
        onClose={() => setClassActionsTarget(null)}
        onEditClass={() => {
          if (!classActionsTarget) return;
          openEdit(classActionsTarget.slotId, classActionsTarget.classEntry);
        }}
        onViewRoster={() => {
          if (!classActionsTarget) return;
          openDetail(
            classActionsTarget.slotId,
            classActionsTarget.classEntry,
            classActionsTarget.slotTime,
          );
        }}
        onSendRoster={() => {
          if (!classActionsTarget) return;
          setSendRosterTarget({
            classId: classActionsTarget.classEntry.id,
            className: classActionsTarget.classEntry.name || 'Untitled class',
            slotTime: classActionsTarget.slotTime,
          });
        }}
        onRemoveClass={() => {
          if (!classActionsTarget) return;
          handleDeleteClass(classActionsTarget.slotId, classActionsTarget.classEntry.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  slotGroup: {
    gap: Spacing.two,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotBacking: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  slotTime: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  slotAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  classCard: {
    padding: Spacing.two,
    gap: Spacing.two,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  classCopy: {
    flex: 1,
    gap: 2,
  },
  className: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  classMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignItems: 'center',
  },
  inlineMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
