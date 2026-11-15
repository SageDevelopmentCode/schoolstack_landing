import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BillingStepStrip, type BillingStepState } from '@/components/parent/billing/sections/billing-step-strip';
import type { ParentBillingPayFlow } from '@/components/parent/billing/use-parent-billing-screen-controller';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GLink, GPressable, GToyButton } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import type { CheckoutPaymentMethod } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';
import {
  formatCentsForInput,
  resolveTuitionPayAmountCents,
  sanitizeDollarDraft,
  type TuitionPayAmountMode,
} from '@/lib/tuition/tuition-pay-amount';
import { EXTRA_PAY_MODE_LABEL } from '@/lib/tuition/tuition-pay-copy';
import { taxCreditPresetAmountCents } from '@/lib/tuition/tuition-pay-presets';

/** How long the sheet takes to close; Stripe checkout waits for it (open-stripe-checkout.ts). */
export const PAYMENT_METHOD_SHEET_CLOSE_MS = 220;

type Step = 'amount' | 'method' | 'review';

const METHODS: {
  id: CheckoutPaymentMethod;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'card', title: 'Credit or debit card', body: 'Pay instantly with card', icon: 'card-outline' },
  {
    id: 'us_bank_account',
    title: 'Bank account (ACH)',
    body: 'Pay from your bank account',
    icon: 'business-outline',
  },
];

/**
 * Guided payment: 1 Amount → 2 Method → 3 Secure checkout. The amount step only
 * appears for "pay a different amount"; otherwise it starts on the method step.
 */
export function BillingPaySheet({ flow }: { flow: ParentBillingPayFlow }) {
  const accent = useGardenAccent();
  const {
    open,
    label,
    loading,
    remainingCents,
    payRemainingYearCents,
    amountMode,
    customDraft,
    showTaxCreditPreset,
    close,
    onDismissed,
    confirm,
  } = flow;

  const showAmountStep = amountMode === 'custom';
  const [step, setStep] = useState<Step>(showAmountStep ? 'amount' : 'method');
  const [mode, setMode] = useState<TuitionPayAmountMode>(amountMode);
  const [draft, setDraft] = useState(customDraft);
  const [method, setMethod] = useState<CheckoutPaymentMethod | null>(null);

  const onDismissedRef = useRef(onDismissed);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    onDismissedRef.current = onDismissed;
  }, [onDismissed]);

  // Reset on open; tell the controller once the close animation has finished.
  useEffect(() => {
    if (open) {
      if (!wasOpenRef.current) {
        setMode(amountMode);
        setDraft(customDraft);
        setMethod(null);
        setStep(amountMode === 'custom' ? 'amount' : 'method');
      }
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      const timer = setTimeout(() => onDismissedRef.current?.(), PAYMENT_METHOD_SHEET_CLOSE_MS);
      return () => clearTimeout(timer);
    }
  }, [open, amountMode, customDraft]);

  const resolution = useMemo(
    () =>
      resolveTuitionPayAmountCents({
        mode,
        remainingCents,
        customDraft: draft,
        payRemainingYearCents:
          payRemainingYearCents > remainingCents ? payRemainingYearCents : undefined,
      }),
    [mode, draft, payRemainingYearCents, remainingCents],
  );

  const taxCreditAmount =
    showTaxCreditPreset && payRemainingYearCents > remainingCents
      ? taxCreditPresetAmountCents({
          currentChargeRemainingCents: remainingCents,
          payRemainingYearCents,
        })
      : null;

  const stepStates: Record<Step, BillingStepState> = {
    amount: step === 'amount' ? 'current' : 'done',
    method: step === 'method' ? 'current' : step === 'review' ? 'done' : 'todo',
    review: step === 'review' ? 'current' : 'todo',
  };
  const chosen = METHODS.find((item) => item.id === method) ?? null;

  const handleClose = () => {
    if (!loading) close();
  };

  return (
    <ParentBottomSheet
      visible={open}
      onClose={handleClose}
      title="Pay tuition"
      subtitle={label}
      accessibilityLabel="Close payment method selection">
      <View style={styles.strip}>
        <BillingStepStrip
          steps={[
            { label: 'Amount', state: stepStates.amount },
            { label: 'Method', state: stepStates.method },
            { label: 'Checkout', state: stepStates.review },
          ]}
        />
      </View>

      <View style={styles.amountBox} accessible accessibilityLabel={`Amount ${formatCents(resolution.amountCents)}`}>
        <Text style={styles.kicker}>{step === 'amount' ? 'You’re paying' : 'Amount'}</Text>
        <Text style={styles.amount}>{formatCents(resolution.amountCents)}</Text>
        {step !== 'amount' && showAmountStep ? (
          <GLink
            label="Change amount"
            icon="create-outline"
            onPress={() => setStep('amount')}
            style={styles.amountLink}
          />
        ) : null}
      </View>

      {step === 'amount' ? (
        <View style={styles.section}>
          <View style={styles.modes} accessibilityRole="radiogroup">
            {(
              [
                ['balance', 'Pay balance due'],
                ['custom', EXTRA_PAY_MODE_LABEL],
              ] as const
            ).map(([id, text]) => {
              const selected = mode === id;
              return (
                <GPressable
                  key={id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, checked: selected }}
                  accessibilityLabel={text}
                  haptic="select"
                  onPress={() => setMode(id)}
                  style={[
                    styles.mode,
                    selected
                      ? { backgroundColor: accent.clay, borderColor: accent.clay }
                      : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
                  ]}>
                  <Text style={[styles.modeText, { color: selected ? Garden.white : Garden.ink }]}>
                    {text}
                  </Text>
                </GPressable>
              );
            })}
          </View>

          {mode === 'custom' ? (
            <View
              style={[
                styles.inputWrap,
                { borderColor: resolution.error ? '#7E4533' : accent.clay },
              ]}>
              <Text style={styles.dollar}>$</Text>
              <TextInput
                value={draft}
                onChangeText={(value) => setDraft(sanitizeDollarDraft(value))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Garden.ink60}
                accessibilityLabel="Payment amount in dollars"
                style={styles.input}
              />
            </View>
          ) : null}

          {resolution.error ? (
            <View style={styles.error} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={16} color="#7E4533" />
              <Text style={styles.errorText}>{resolution.error}</Text>
            </View>
          ) : null}

          {taxCreditAmount != null ? (
            <GPressable
              accessibilityLabel={`Apply $5,000 tax credit, ${formatCents(taxCreditAmount)}`}
              haptic="select"
              onPress={() => {
                setMode('custom');
                setDraft(formatCentsForInput(taxCreditAmount));
              }}
              style={styles.preset}>
              <Ionicons name="ribbon-outline" size={18} color={Garden.ink} />
              <Text style={styles.presetText}>
                Apply $5,000 tax credit ({formatCents(taxCreditAmount)})
              </Text>
            </GPressable>
          ) : null}

          <GToyButton
            fullWidth
            size="md"
            label="Next: payment method"
            disabled={Boolean(resolution.error)}
            onPress={() => setStep('method')}
          />
        </View>
      ) : null}

      {step === 'method' ? (
        <View style={styles.section}>
          <Text style={styles.prompt}>How would you like to pay?</Text>
          {METHODS.map((item) => (
            <GPressable
              key={item.id}
              accessibilityLabel={`${item.title}. ${item.body}`}
              accessibilityState={{ disabled: Boolean(resolution.error) }}
              disabled={Boolean(resolution.error)}
              haptic="select"
              pressedScale={0.98}
              onPress={() => {
                setMethod(item.id);
                setStep('review');
              }}
              style={styles.methodCard}>
              <View style={[styles.methodIcon, { backgroundColor: accent.wash }]}>
                <Ionicons name={item.icon} size={22} color={accent.clayDeep} />
              </View>
              <View style={styles.methodCopy}>
                <Text style={styles.methodTitle}>{item.title}</Text>
                <Text style={styles.methodBody}>{item.body}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
            </GPressable>
          ))}
        </View>
      ) : null}

      {step === 'review' && chosen ? (
        <View style={styles.section}>
          <View style={styles.summary}>
            <SummaryRow label="For" value={label} />
            <SummaryRow label="Amount" value={formatCents(resolution.amountCents)} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Method</Text>
              <View style={styles.summaryMethod}>
                <Text style={styles.summaryValue}>{chosen.title}</Text>
                {!loading ? (
                  <GLink
                    label="Change"
                    icon={null}
                    onPress={() => setStep('method')}
                    accessibilityLabel="Change payment method"
                  />
                ) : null}
              </View>
            </View>
          </View>

          {chosen.id === 'us_bank_account' ? (
            <View style={styles.note}>
              <Ionicons name="time-outline" size={16} color={Garden.ink65} />
              <Text style={styles.noteText}>
                Bank payments usually take 3–5 business days to process.
              </Text>
            </View>
          ) : null}

          <GToyButton
            fullWidth
            size="md"
            icon="lock-closed"
            label={loading ? 'Starting checkout…' : 'Continue to secure checkout'}
            loading={loading}
            disabled={Boolean(resolution.error)}
            accessibilityHint="Opens Stripe's secure checkout page"
            onPress={() => confirm(chosen.id, resolution.amountCents)}
          />
          <View style={styles.secure}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Garden.soft} />
            <Text style={styles.secureText}>
              You&apos;ll finish on Stripe&apos;s secure checkout page.
            </Text>
          </View>
        </View>
      ) : null}
    </ParentBottomSheet>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    alignItems: 'center',
    paddingTop: 4,
  },
  amountBox: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Garden.cream,
  },
  kicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  amount: {
    fontFamily: GardenFonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    color: Garden.ink,
  },
  amountLink: {
    alignSelf: 'center',
  },
  section: {
    gap: 12,
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mode: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  modeText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: Garden.white,
  },
  dollar: {
    fontFamily: GardenFonts.display,
    fontSize: 24,
    color: Garden.ink65,
  },
  input: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 24,
    color: Garden.ink,
    paddingVertical: 10,
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
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Garden.butter,
  },
  presetText: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  prompt: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
  },
  methodBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  summary: {
    padding: 14,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.notebook,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  summaryMethod: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Garden.sky,
  },
  noteText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.ink65,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secureText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
});
