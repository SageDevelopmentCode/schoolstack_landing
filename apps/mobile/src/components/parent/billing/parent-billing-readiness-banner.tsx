import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
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
  const theme = useAdminTheme();

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
      body = 'Complete your enrollment checklist to select an installment plan and generate tuition charges.';
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
        { backgroundColor: `${theme.accent}12`, borderColor: `${theme.accent}33` },
      ]}>
      <Ionicons name="information-circle-outline" size={22} color={theme.accent} />
      <View style={styles.textColumn}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
          {body}
        </ThemedText>
        {cta && onOpenEnrollment ? (
          <Pressable
            onPress={onOpenEnrollment}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {cta}
            </ThemedText>
            <Ionicons name="open-outline" size={14} color={theme.accent} />
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
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
  },
});
