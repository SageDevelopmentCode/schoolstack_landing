import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentBillingNeedsScheduleBadge } from '@/components/parent/billing/parent-billing-needs-schedule-badge';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import type { ParentBillingChildView } from '@/lib/parent/parent-portal-api';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';
import { formatBillingDueDate, formatCents } from '@/lib/tuition/format-cents';

type ParentBillingByStudentSectionProps = {
  childViews: ParentBillingChildView[];
  onSelectChild: (childKey: string) => void;
};

export function ParentBillingByStudentSection({
  childViews,
  onSelectChild,
}: ParentBillingByStudentSectionProps) {
  const theme = useParentTheme();

  if (childViews.length <= 1) return null;

  return (
    <View style={styles.section}>
      <StoryDisplayHeading size="section">By student</StoryDisplayHeading>
      <View style={styles.list}>
        {childViews.map((child) => {
          const firstName = childFirstNameFromFullName(child.studentName);

          return (
            <Pressable
              key={child.childKey}
              onPress={() => onSelectChild(child.childKey)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: theme.white,
                  borderColor: theme.line,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <View style={styles.rowText}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: theme.ink }]}>{firstName}</Text>
                  {child.status === 'ready' ? (
                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  ) : null}
                  {child.status === 'needs_schedule' ? (
                    <ParentBillingNeedsScheduleBadge label="Schedule needed" size="sm" />
                  ) : null}
                </View>
                <View style={styles.metaRow}>
                  {child.balanceDueCents > 0 && child.nextCharge ? (
                    <View
                      style={[styles.duePill, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.duePillText, { color: theme.primary }]}>
                        Due {formatBillingDueDate(child.nextCharge.dueDate)} ·{' '}
                        {formatCents(child.balanceDueCents)}
                      </Text>
                    </View>
                  ) : child.balanceDueCents > 0 ? (
                    <View
                      style={[styles.duePill, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.duePillText, { color: theme.primary }]}>
                        Due {formatCents(child.balanceDueCents)}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.planLabel, { color: theme.muted }]}>
                    {child.paymentPlanLabel ?? `Annual ${formatCents(child.annualTuitionCents)}`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderRadius: StoryRadius.cardCompact,
    borderWidth: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  duePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  duePillText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 11,
    fontWeight: '500',
  },
  planLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
