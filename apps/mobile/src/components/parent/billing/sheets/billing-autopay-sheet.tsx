import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { closeThen, type ParentBillingModel } from '@/components/parent/billing/use-parent-billing-model';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GLink, GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import type { SavedPaymentMethodSummary } from '@/lib/parent/parent-portal-api';
import { formatPaymentMethodLabel } from '@/lib/tuition/billing-helpers';

/** Confirm turning autopay on or off, with what changes and which card it uses. */
export function BillingAutopaySheet({
  autopay,
  savedPaymentMethod,
  onAddCard,
}: {
  autopay: ParentBillingModel['autopay'];
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  onAddCard: () => void;
}) {
  const enabling = autopay.target;
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <ParentBottomSheet
      visible={autopay.open}
      onClose={autopay.close}
      title={enabling ? 'Enable autopay?' : 'Turn off autopay?'}
      subtitle="Payment settings"
      accessibilityLabel="Close autopay settings">
      <View style={styles.what}>
        <View style={[styles.icon, { backgroundColor: enabling ? Garden.mint : Garden.peach }]}>
          <Ionicons name={enabling ? 'sync' : 'hand-left-outline'} size={22} color={Garden.ink} />
        </View>
        <Text style={styles.body}>
          {enabling
            ? 'Due charges will be paid automatically with your saved payment method.'
            : 'You will need to pay each charge manually.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="card-outline" size={18} color={Garden.ink65} />
        <Text style={styles.cardText}>{methodLabel ?? 'No card saved yet'}</Text>
      </View>

      {enabling && !methodLabel ? (
        <View style={styles.tip}>
          <Text style={styles.tipTitle}>Add a card first</Text>
          <Text style={styles.tipBody}>Autopay needs a saved card to run on each due date.</Text>
          <GOutlineButton
            label="Add a card"
            icon="add"
            onPress={() => closeThen(autopay.close, onAddCard)}
            style={styles.tipButton}
          />
        </View>
      ) : null}

      {autopay.error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={16} color="#7E4533" />
          <Text style={styles.errorText}>{autopay.error}</Text>
        </View>
      ) : null}

      <GToyButton
        fullWidth
        size="md"
        icon={enabling ? 'checkmark' : 'close'}
        label={autopay.saving ? 'Saving…' : enabling ? 'Enable' : 'Turn off'}
        loading={autopay.saving}
        onPress={autopay.confirm}
      />
      {!autopay.saving ? (
        <GLink label="Cancel" icon={null} onPress={autopay.close} style={styles.cancel} />
      ) : null}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  what: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Garden.ink,
  },
  body: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.ink,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Garden.cream,
  },
  cardText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  tip: {
    gap: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Garden.butter,
  },
  tipTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  tipBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.ink65,
  },
  tipButton: {
    marginTop: 8,
    minHeight: 44,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Garden.peach,
  },
  errorText: {
    flex: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: '#7E4533',
  },
  cancel: {
    alignSelf: 'center',
  },
});
