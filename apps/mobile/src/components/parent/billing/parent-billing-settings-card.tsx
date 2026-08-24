import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import type { SavedPaymentMethodSummary } from '@/lib/parent/parent-portal-api';
import { formatPaymentMethodLabel } from '@/lib/tuition/billing-helpers';

type ParentBillingSettingsCardProps = {
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggle: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
};

export function ParentBillingSettingsCard({
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggle,
  onManagePaymentMethod,
}: ParentBillingSettingsCardProps) {
  const theme = useAdminTheme();
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          adminCardShadow(theme),
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Saved payment method
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
          {methodLabel ?? 'No card on file'}
        </ThemedText>
        <Pressable
          onPress={onManagePaymentMethod}
          disabled={paymentMethodLoading}
          accessibilityRole="button"
          accessibilityLabel="Update card"
          style={({ pressed }) => [
            styles.manageButton,
            { borderColor: theme.border },
            pressed && { opacity: 0.8 },
          ]}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {paymentMethodLoading ? 'Opening…' : methodLabel ? 'Update card' : 'Add card'}
          </ThemedText>
          <Ionicons name="open-outline" size={16} color={theme.accent} />
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          adminCardShadow(theme),
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <View style={styles.autopayRow}>
          <View style={styles.autopayText}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              Autopay
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              {autopayEnabled
                ? 'Due charges are paid automatically with your saved card.'
                : 'Pay each charge manually in the parent portal.'}
            </ThemedText>
          </View>
          <Switch
            value={autopayEnabled}
            onValueChange={onAutopayToggle}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Autopay"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  autopayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  autopayText: {
    flex: 1,
  },
});
