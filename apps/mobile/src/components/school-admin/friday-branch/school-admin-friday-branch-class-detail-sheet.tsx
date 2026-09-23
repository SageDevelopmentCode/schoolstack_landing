import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SchoolAdminFridayBranchStatusTag } from '@/components/school-admin/friday-branch/school-admin-friday-branch-status-tag';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';
import { fetchFridayBranchClassDetail } from '@/lib/school-admin/friday-branch/friday-branch-api';
import type {
  FridayBranchClass,
  FridayBranchClassDetail,
  FridayBranchClassEnrollmentStatus,
} from '@/lib/school-admin/friday-branch/friday-branch-types';
import { formatFridayBranchPriceDisplay } from '@/lib/school-admin/friday-branch/friday-branch-price-utils';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchClassDetailSheetProps = {
  visible: boolean;
  organizationId: string;
  classId: string | null;
  fallbackClass?: FridayBranchClass | null;
  fallbackSlotTime?: string;
  onClose: () => void;
  onEditClass: (classEntry: FridayBranchClass) => void;
};

function enrollmentStatusVariant(
  status: FridayBranchClassEnrollmentStatus,
): 'green' | 'amber' | 'purple' {
  if (status === 'waitlisted') return 'amber';
  if (status === 'withdrawn') return 'purple';
  return 'green';
}

function enrollmentStatusLabel(status: FridayBranchClassEnrollmentStatus): string {
  if (status === 'waitlisted') return 'Waitlisted';
  if (status === 'withdrawn') return 'Withdrawn';
  return 'Confirmed';
}

function formatCapacityLabel(capacity: number | null | undefined, enrollmentCount: number): string {
  if (!capacity) return 'Unlimited';
  return `${enrollmentCount} of ${capacity} spots`;
}

export function SchoolAdminFridayBranchClassDetailSheet({
  visible,
  organizationId,
  classId,
  fallbackClass,
  fallbackSlotTime,
  onClose,
  onEditClass,
}: SchoolAdminFridayBranchClassDetailSheetProps) {
  const theme = useParentTheme();
  const [detail, setDetail] = useState<FridayBranchClassDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const reportError = createSchoolAdminErrorReporter(organizationId);

  useEffect(() => {
    if (!visible || !classId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const payload = await fetchFridayBranchClassDetail(organizationId, classId);
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (error) {
        reportError('friday_branch.class.detail.load', error);
        if (!cancelled) {
          setDetail(null);
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
  }, [classId, organizationId, reportError, visible]);

  const classEntry = detail?.class ?? fallbackClass;
  const slotTime = detail?.slotTime ?? fallbackSlotTime ?? '—';

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close class detail">
      <ScrollView contentContainerStyle={styles.content}>
        {loading && !detail ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : classEntry ? (
          <>
            <Text style={[styles.title, { color: theme.ink }]}>
              {classEntry.name || 'Untitled class'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {slotTime}
              {detail?.blockLabel ? ` · ${detail.blockLabel}` : ''}
            </Text>

            <StoryCard compact style={styles.metaCard}>
              <MetaRow label="Location" value={classEntry.location || 'Not set'} />
              <MetaRow label="Age group" value={classEntry.ageGroup || 'Not set'} />
              <MetaRow label="Leader" value={classEntry.teacher || 'Not set'} />
              <MetaRow label="Price" value={formatFridayBranchPriceDisplay(classEntry.priceCents)} />
              <MetaRow
                label="Capacity"
                value={formatCapacityLabel(classEntry.capacity, detail?.enrollmentCount ?? 0)}
              />
            </StoryCard>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>Enrolled students</Text>
              <Text style={[styles.sectionMeta, { color: theme.muted }]}>
                {detail?.enrollments.length ?? 0} total
              </Text>
            </View>

            {detail && detail.enrollments.length > 0 ? (
              detail.enrollments.map((enrollment) => (
                <StoryCard key={enrollment.id} compact style={styles.enrollmentCard}>
                  <View style={styles.enrollmentRow}>
                    <View style={styles.enrollmentCopy}>
                      <Text style={[styles.enrollmentName, { color: theme.ink }]}>
                        {enrollment.studentName}
                      </Text>
                      <Text style={[styles.enrollmentMeta, { color: theme.muted }]}>
                        {enrollment.familyName}
                      </Text>
                    </View>
                    <SchoolAdminFridayBranchStatusTag
                      label={enrollmentStatusLabel(enrollment.status)}
                      variant={enrollmentStatusVariant(enrollment.status)}
                    />
                  </View>
                </StoryCard>
              ))
            ) : (
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                No enrollments yet for this class.
              </Text>
            )}

            <StoryButton
              label="Edit class"
              previewSafe
              onPress={() => onEditClass(classEntry)}
            />
          </>
        ) : (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>Class not found.</Text>
        )}
      </ScrollView>
    </StoryBottomSheet>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useParentTheme();

  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  loader: {
    marginVertical: Spacing.six,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.one,
  },
  metaCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  metaRow: {
    gap: 2,
  },
  metaLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  enrollmentCard: {
    padding: StoryCardPadding,
  },
  enrollmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  enrollmentCopy: {
    flex: 1,
    gap: 2,
  },
  enrollmentName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  enrollmentMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
