import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchFlyerTarget,
  ParentFridayBranchStudentEnrollmentState,
  ParentFridayBranchStudentOption,
} from '@/lib/parent/parent-friday-branch-types';
import {
  formatFridayBranchSpotsLabel,
  getFridayBranchChildChipPresentation,
  getInitialFridayBranchChildSelection,
  isFridayBranchChildChipDisabled,
  partitionFridayBranchChildSelection,
  syncFridayBranchChildSelection,
} from '@/lib/parent/parent-friday-branch-utils';
import {
  enrollParentFridayBranchClass,
  fetchParentFridayBranchClassDetail,
  withdrawParentFridayBranchClass,
} from '@/lib/parent/parent-portal-api';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentFridayBranchClassSheetProps = {
  visible: boolean;
  organizationId: string;
  classId: string | null;
  fallbackSummary?: ParentFridayBranchClassSummary | null;
  blockLabel?: string;
  blockDateRange?: string;
  studentOptions: ParentFridayBranchStudentOption[];
  onClose: () => void;
  onEnrollmentChange: (classId: string, detail: ParentFridayBranchClassDetailBundle) => void;
  onViewFlyer: (target: ParentFridayBranchFlyerTarget) => void;
};

function toggleStudentSelection(current: Set<string>, studentId: string): Set<string> {
  const next = new Set(current);
  if (next.has(studentId)) next.delete(studentId);
  else next.add(studentId);
  return next;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const theme = useParentTheme();
  return (
    <View style={styles.detailField}>
      <Text style={[styles.detailLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

export function ParentFridayBranchClassSheet({
  visible,
  organizationId,
  classId,
  fallbackSummary = null,
  blockLabel,
  blockDateRange,
  studentOptions,
  onClose,
  onEnrollmentChange,
  onViewFlyer,
}: ParentFridayBranchClassSheetProps) {
  const theme = useParentTheme();
  const [detail, setDetail] = useState<ParentFridayBranchClassDetailBundle | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'enroll' | 'withdraw' | null>(null);

  useEffect(() => {
    if (!visible || !classId) {
      setDetail(null);
      setSelectedStudentIds(new Set());
      setLoadError(null);
      setActionError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setActionError(null);

    void fetchParentFridayBranchClassDetail(organizationId, classId)
      .then((nextDetail) => {
        if (cancelled) return;
        setDetail(nextDetail);
        setSelectedStudentIds(new Set(getInitialFridayBranchChildSelection(nextDetail.studentStates)));
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load class.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [classId, organizationId, visible]);

  const { enrollableIds, withdrawableIds } = useMemo(
    () => partitionFridayBranchChildSelection(detail?.studentStates ?? [], selectedStudentIds),
    [detail?.studentStates, selectedStudentIds],
  );

  const displayName = detail?.name ?? fallbackSummary?.name ?? 'Class details';
  const displaySlotTime = detail?.slotTime ?? fallbackSummary?.slotTime;
  const displayLocation = detail?.location ?? fallbackSummary?.location ?? '—';
  const displayBlockLabel = detail?.blockLabel ?? blockLabel ?? 'Schedule';
  const displayBlockDateRange = detail?.blockDateRange ?? blockDateRange ?? '';
  const displayPriceCents = detail?.priceCents ?? fallbackSummary?.priceCents ?? null;
  const displayHasFlyer = detail?.hasFlyer ?? fallbackSummary?.hasFlyer ?? false;
  const displayFlyerFileName =
    detail?.flyerFileName ?? fallbackSummary?.flyerFileName ?? `${displayName} flyer`;
  const spotsLabel = detail
    ? formatFridayBranchSpotsLabel({
        classId: detail.classId,
        slotId: detail.slotId,
        slotTime: detail.slotTime,
        name: detail.name,
        location: detail.location,
        ageGroup: detail.ageGroup,
        teacher: detail.teacher,
        capacity: detail.capacity,
        priceCents: detail.priceCents,
        hasFlyer: detail.hasFlyer,
        flyerFileName: detail.flyerFileName,
        confirmedCount: detail.confirmedCount,
        spotsRemaining: detail.spotsRemaining,
        familyEnrollments: [],
      })
    : null;

  async function runAction(type: 'enroll' | 'withdraw', studentIds: string[]) {
    if (!classId || studentIds.length === 0) return;

    setPendingAction(type);
    setActionError(null);

    let lastDetail: ParentFridayBranchClassDetailBundle | null = detail;

    try {
      for (const studentId of studentIds) {
        const nextDetail =
          type === 'enroll'
            ? await enrollParentFridayBranchClass(organizationId, classId, studentId)
            : await withdrawParentFridayBranchClass(organizationId, classId, studentId);
        lastDetail = nextDetail;
        setDetail(nextDetail);
      }

      if (!lastDetail) {
        throw new Error('Failed to update sign-up.');
      }

      setSelectedStudentIds(
        new Set(syncFridayBranchChildSelection(lastDetail.studentStates, selectedStudentIds)),
      );
      onEnrollmentChange(classId, lastDetail);
    } catch (error) {
      if (lastDetail && lastDetail !== detail) {
        setSelectedStudentIds(
          new Set(syncFridayBranchChildSelection(lastDetail.studentStates, selectedStudentIds)),
        );
        onEnrollmentChange(classId, lastDetail);
      }
      setActionError(error instanceof Error ? error.message : 'Failed to update sign-up.');
    } finally {
      setPendingAction(null);
    }
  }

  function handleToggleStudent(student: ParentFridayBranchStudentEnrollmentState) {
    if (isFridayBranchChildChipDisabled(student)) return;
    setSelectedStudentIds((current) => toggleStudentSelection(current, student.studentId));
  }

  const canEnroll = enrollableIds.length > 0;
  const canWithdraw = withdrawableIds.length > 0;
  const enrollLabel =
    detail?.spotsRemaining === 0
      ? `Join waitlist (${enrollableIds.length})`
      : `Sign up (${enrollableIds.length})`;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={displayName}
      subtitle={displayBlockLabel}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}

      {loadError ? (
        <View style={styles.centered}>
          <Text style={[styles.errorCopy, { color: theme.alert }]}>{loadError}</Text>
        </View>
      ) : null}

      {!isLoading && !loadError ? (
        <View style={styles.content}>
          <StorySectionKicker>{displayBlockDateRange}</StorySectionKicker>

          <View style={styles.detailGrid}>
            {displaySlotTime ? <DetailField label="Time" value={displaySlotTime} /> : null}
            <DetailField label="Location" value={displayLocation} />
            {detail?.ageGroup ? <DetailField label="Ages" value={detail.ageGroup} /> : null}
            {displayPriceCents != null ? (
              <DetailField label="Price" value={formatFeeAmount(displayPriceCents)} />
            ) : null}
            {spotsLabel ? <DetailField label="Spots" value={spotsLabel} /> : null}
          </View>

          {displayHasFlyer && classId ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                onViewFlyer({
                  classId,
                  fileName: displayFlyerFileName,
                })
              }
              style={styles.flyerLink}>
              <Ionicons name="document-text-outline" size={16} color={theme.primary} />
              <Text style={[styles.flyerLinkText, { color: theme.primary }]}>View flyer</Text>
            </Pressable>
          ) : null}

          {studentOptions.length > 0 && detail ? (
            <View style={styles.childrenSection}>
              <Text style={[styles.childrenHeading, { color: theme.ink }]}>Your children</Text>
              <View style={styles.chipRow}>
                {detail.studentStates.map((student) => {
                  const active = selectedStudentIds.has(student.studentId);
                  const presentation = getFridayBranchChildChipPresentation(student, active, theme);
                  const disabled = isFridayBranchChildChipDisabled(student);

                  return (
                    <Pressable
                      key={student.studentId}
                      accessibilityRole="button"
                      accessibilityLabel={presentation.ariaLabel}
                      disabled={disabled}
                      onPress={() => handleToggleStudent(student)}
                      style={[
                        styles.childChip,
                        {
                          backgroundColor: presentation.backgroundColor,
                          borderColor: presentation.borderColor,
                          opacity: disabled ? 0.6 : 1,
                        },
                      ]}>
                      {presentation.icon === 'check' ? (
                        <Ionicons name="checkmark" size={14} color={presentation.color} />
                      ) : null}
                      {presentation.icon === 'clock' ? (
                        <Ionicons name="time-outline" size={14} color={presentation.color} />
                      ) : null}
                      <Text style={[styles.childChipText, { color: presentation.color }]}>
                        {student.studentName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {studentOptions.length === 0 ? (
                <Text style={[styles.helperCopy, { color: theme.muted }]}>
                  Add a child under My children before signing up.
                </Text>
              ) : null}
            </View>
          ) : null}

          {actionError ? (
            <Text style={[styles.errorCopy, { color: theme.alert }]}>{actionError}</Text>
          ) : null}

          {detail && studentOptions.length > 0 ? (
            <View style={styles.actions}>
              {canEnroll ? (
                <StoryButton
                  label={pendingAction === 'enroll' ? 'Signing up…' : enrollLabel}
                  previewSafe
                  disabled={pendingAction !== null}
                  onPress={() => void runAction('enroll', enrollableIds)}
                />
              ) : null}
              {canWithdraw ? (
                <StoryButton
                  label={
                    pendingAction === 'withdraw'
                      ? 'Withdrawing…'
                      : `Withdraw (${withdrawableIds.length})`
                  }
                  previewSafe
                  variant="soft"
                  disabled={pendingAction !== null}
                  onPress={() => void runAction('withdraw', withdrawableIds)}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  centered: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    gap: Spacing.four,
  },
  detailGrid: {
    gap: Spacing.three,
  },
  detailField: {
    gap: 2,
  },
  detailLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  flyerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flyerLinkText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  childrenSection: {
    gap: Spacing.three,
  },
  childrenHeading: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  childChipText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
    fontWeight: '500',
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: Spacing.three,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
