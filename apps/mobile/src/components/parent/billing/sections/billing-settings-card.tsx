import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GOutlineButton, GPressable } from '@/components/parent/garden/ui';
import type { SavedPaymentMethodSummary } from '@/lib/parent/parent-portal-api';
import { formatPaymentMethodLabel } from '@/lib/tuition/billing-helpers';

/** "Payment settings": the screen's one dark card. Autopay state + saved card. */
export function BillingSettingsCard({
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopay,
  onManagePaymentMethod,
  index = 0,
}: {
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopay: () => void;
  onManagePaymentMethod: () => void;
  index?: number;
}) {
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <GCard
      index={index}
      tone="dark"
      kicker="Payment settings"
      title={autopayEnabled ? 'Autopay is on' : 'Autopay is off'}
      action={
        <View style={[styles.state, autopayEnabled ? styles.stateOn : styles.stateOff]}>
          <View style={[styles.stateDot, { backgroundColor: autopayEnabled ? Garden.forest : 'rgba(255,255,255,0.7)' }]} />
          <Text style={[styles.stateText, { color: autopayEnabled ? Garden.forest : Garden.white }]}>
            {autopayEnabled ? 'On' : 'Off'}
          </Text>
        </View>
      }
      testID="parent-billing-family-settings">
      <Text style={styles.body}>
        {autopayEnabled
          ? 'Due charges are paid automatically with your saved card on each due date.'
          : "Turn on automatic payments and we'll process each scheduled tuition payment on its due date."}
      </Text>

      <View style={styles.methodCard} testID="parent-payment-method-card">
        <Text style={styles.methodKicker}>Payment method</Text>
        <GPressable
          testID="parent-payment-method-manage"
          accessibilityLabel={
            methodLabel ? `Payment method ${methodLabel}. Change card` : 'Add a card'
          }
          accessibilityHint="Opens secure card setup"
          disabled={paymentMethodLoading}
          accessibilityState={{ busy: paymentMethodLoading, disabled: paymentMethodLoading }}
          onPress={onManagePaymentMethod}
          style={styles.methodRow}>
          <View style={styles.methodIcon}>
            <Ionicons name="card-outline" size={18} color={Garden.ink} />
          </View>
          <Text style={styles.methodLabel} numberOfLines={1}>
            {methodLabel ?? 'Add a card'}
          </Text>
          {paymentMethodLoading ? (
            <ActivityIndicator color={Garden.white} />
          ) : (
            <Ionicons name="arrow-forward" size={16} color={Garden.white} />
          )}
        </GPressable>
      </View>

      <View testID="parent-billing-autopay-toggle" style={styles.toggleWrap}>
        <GOutlineButton
          onDark
          label={autopayEnabled ? 'Manage autopay' : 'Turn on autopay'}
          icon={autopayEnabled ? 'settings-outline' : 'sync-outline'}
          accessibilityLabel={
            autopayEnabled ? 'Manage autopay, currently on' : 'Turn on autopay, currently off'
          }
          onPress={onAutopay}
          style={styles.toggle}
        />
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  state: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stateOn: {
    backgroundColor: Garden.mint,
  },
  stateOff: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
  },
  body: {
    marginTop: 6,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.85)',
  },
  methodCard: {
    marginTop: 14,
    gap: 6,
  },
  methodKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.white,
  },
  methodLabel: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.white,
  },
  toggleWrap: {
    marginTop: 14,
  },
  toggle: {
    alignSelf: 'stretch',
    minHeight: 46,
  },
});
