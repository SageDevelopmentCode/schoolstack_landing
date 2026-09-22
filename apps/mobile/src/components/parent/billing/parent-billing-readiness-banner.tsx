import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { FamilyBillingReadiness } from '@/lib/parent/parent-portal-api';

type ParentBillingReadinessBannerProps = {
  readiness: FamilyBillingReadiness;
  hasCharges: boolean;
  hasPendingSchedule: boolean;
  onOpenEnrollment?: () => void;
};

export function ParentBillingReadinessBanner({
  readiness,
  hasCharges,
  hasPendingSchedule,
  onOpenEnrollment,
}: ParentBillingReadinessBannerProps) {
  const theme = useParentTheme();

  if (hasCharges) return null;

  const childrenLabel =
    readiness.childrenNames.length > 0
      ? readiness.childrenNames.join(', ')
      : 'your student';

  let title: string | null = null;
  let body: string | null = null;
  let cta: string | null = null;

  switch (readiness.state) {
    case 'needs_assignment':
      title = 'Tuition has not been assigned yet';
      body = `Billing for ${childrenLabel} has not been set up by your school yet. Charges will appear here once tuition is assigned.`;
      break;
    case 'needs_payment_plan':
      if (hasPendingSchedule) return null;
      title = 'Choose your payment schedule';
      body =
        'Complete your enrollment checklist to select an installment plan and generate tuition charges.';
      cta = readiness.enrollmentChecklistHref ? 'Go to enrollment' : null;
      break;
    case 'no_charges':
      title = 'Your schedule is being prepared';
      body =
        'Your school is finalizing tuition details. Check back soon or complete any remaining enrollment steps.';
      cta = readiness.enrollmentChecklistHref ? 'Go to enrollment' : null;
      break;
    default:
      return null;
  }

  if (!title) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.primarySoft, borderColor: `${theme.primary}33` },
      ]}>
      <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
        {cta && onOpenEnrollment ? (
          <Pressable
            onPress={onOpenEnrollment}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}>
            <Text style={[styles.ctaText, { color: theme.primary }]}>{cta}</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
  },
  ctaText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
});
