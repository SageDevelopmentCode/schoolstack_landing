import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type {
  ParentFridayBranchClassSummary,
  ParentFridayBranchFlyerTarget,
  ParentFridayBranchStudentOption,
} from '@/lib/parent/parent-friday-branch-types';
import {
  getFridayBranchRowCta,
  getFridayBranchSpotsBadge,
  groupClassesBySlot,
  studentNameById,
  type FridayBranchRowCta,
} from '@/lib/parent/parent-friday-branch-utils';
import { StoryCardPadding, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentFridayBranchScheduleProps = {
  classes: ParentFridayBranchClassSummary[];
  studentOptions: ParentFridayBranchStudentOption[];
  blockLabel: string;
  blockDateRange: string;
  onOpenClass: (classId: string) => void;
  onViewFlyer: (target: ParentFridayBranchFlyerTarget) => void;
};

type ClassRowCtaProps = {
  label: string;
  variant: FridayBranchRowCta['variant'];
  onPress: () => void;
};

function ClassRowCta({ label, variant, onPress }: ClassRowCtaProps) {
  const theme = useParentTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ctaPill,
        {
          backgroundColor: isPrimary ? theme.primary : theme.primarySoft,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <Text
        style={[
          styles.ctaLabel,
          { color: isPrimary ? theme.white : theme.primary },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ParentFridayBranchSchedule({
  classes,
  studentOptions,
  blockLabel,
  blockDateRange,
  onOpenClass,
  onViewFlyer,
}: ParentFridayBranchScheduleProps) {
  const theme = useParentTheme();
  const slotGroups = groupClassesBySlot(classes);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StorySectionKicker>{blockLabel}</StorySectionKicker>
        <Text style={[styles.dateRange, { color: theme.muted }]}>{blockDateRange}</Text>
      </View>

      {slotGroups.map((group) => (
        <View key={group.slotId} style={styles.slotGroup}>
          <View style={[styles.timePill, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.timePillText, { color: theme.primary }]}>
              {group.slotTime || '—'}
            </Text>
          </View>

          {group.classes.map((classSummary) => {
            const spotsBadge = getFridayBranchSpotsBadge(classSummary);
            const cta = getFridayBranchRowCta(classSummary);
            const hasEnrollment = classSummary.familyEnrollments.length > 0;
            const openClass = () => onOpenClass(classSummary.classId);

            return (
              <StoryCard key={classSummary.classId} compact style={styles.classCard}>
                <View style={styles.classContent}>
                  <View style={styles.classHeader}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={openClass}
                      style={styles.classCopy}>
                      <Text style={[styles.className, { color: theme.ink }]}>
                        {classSummary.name}
                      </Text>
                      {classSummary.teacher ? (
                        <Text style={[styles.teacher, { color: theme.muted }]}>
                          with {classSummary.teacher}
                        </Text>
                      ) : null}
                    </Pressable>
                    <ClassRowCta label={cta.label} variant={cta.variant} onPress={openClass} />
                  </View>

                  <Pressable accessibilityRole="button" onPress={openClass} style={styles.classBody}>
                    <View style={styles.metaRow}>
                      {classSummary.location ? (
                        <Text style={[styles.metaText, { color: theme.muted }]}>
                          {classSummary.location}
                        </Text>
                      ) : null}
                      {classSummary.ageGroup ? (
                        <StoryChip tone="info" label={classSummary.ageGroup} uppercase={false} />
                      ) : null}
                      {classSummary.priceCents != null ? (
                        <Text style={[styles.metaText, { color: theme.muted }]}>
                          {formatFeeAmount(classSummary.priceCents)}
                        </Text>
                      ) : null}
                      {!hasEnrollment ? (
                        <StoryChip
                          tone={spotsBadge.tone}
                          label={spotsBadge.label}
                          uppercase={false}
                        />
                      ) : null}
                    </View>

                    {hasEnrollment ? (
                      <View style={styles.enrollmentRow}>
                        {classSummary.familyEnrollments.map((enrollment) => (
                          <StoryChip
                            key={enrollment.enrollmentId}
                            tone={enrollment.status === 'waitlisted' ? 'warning' : 'success'}
                            label={`${studentNameById(studentOptions, enrollment.studentId)}${
                              enrollment.status === 'waitlisted' ? ' · Waitlist' : ''
                            }`}
                            uppercase={false}
                          />
                        ))}
                      </View>
                    ) : null}
                  </Pressable>

                  {classSummary.hasFlyer ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        onViewFlyer({
                          classId: classSummary.classId,
                          fileName:
                            classSummary.flyerFileName?.trim() || `${classSummary.name} flyer`,
                        })
                      }
                      style={styles.flyerLink}>
                      <Ionicons name="document-text-outline" size={14} color={theme.primary} />
                      <Text style={[styles.flyerLinkText, { color: theme.primary }]}>
                        View flyer
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </StoryCard>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    gap: Spacing.one,
  },
  dateRange: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  slotGroup: {
    gap: Spacing.three,
  },
  timePill: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.one,
  },
  timePillText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  classCard: {
    padding: StoryCardPadding,
  },
  classContent: {
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
    minWidth: 0,
    gap: 2,
  },
  classBody: {
    gap: Spacing.two,
  },
  className: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  teacher: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  ctaPill: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    borderRadius: StoryRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ctaLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaText: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  enrollmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  flyerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  flyerLinkText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
