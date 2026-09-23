import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { CheckoutPaymentMethod } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';
import { taxCreditPresetAmountCents } from '@/lib/tuition/tuition-pay-presets';
import { EXTRA_PAY_MODE_LABEL } from '@/lib/tuition/tuition-pay-copy';
import {
  formatCentsForInput,
  resolveTuitionPayAmountCents,
  sanitizeDollarDraft,
  type TuitionPayAmountMode,
} from '@/lib/tuition/tuition-pay-amount';

export const PAYMENT_METHOD_SHEET_CLOSE_MS = 220;

type ParentPaymentMethodSheetProps = {
  visible: boolean;
  label: string;
  loading: boolean;
  remainingCents: number;
  payRemainingYearCents?: number;
  amountMode?: TuitionPayAmountMode;
  customDraft?: string;
  showTaxCreditPreset?: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  onSelect: (method: CheckoutPaymentMethod, amountCents: number) => void;
};

export function ParentPaymentMethodSheet({
  visible,
  label,
  loading,
  remainingCents,
  payRemainingYearCents = 0,
  amountMode = 'balance',
  customDraft = '',
  showTaxCreditPreset = false,
  onClose,
  onDismissed,
  onSelect,
}: ParentPaymentMethodSheetProps) {
  const theme = useParentTheme();
  const onDismissedRef = useRef(onDismissed);
  const wasVisibleRef = useRef(false);
  const [localMode, setLocalMode] = useState<TuitionPayAmountMode>(amountMode);
  const [localDraft, setLocalDraft] = useState(customDraft);
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    onDismissedRef.current = onDismissed;
  }, [onDismissed]);

  useEffect(() => {
    if (visible) {
      setLocalMode(amountMode);
      setLocalDraft(customDraft);
      wasVisibleRef.current = true;
      return;
    }

    if (wasVisibleRef.current) {
      wasVisibleRef.current = false;
      const timer = setTimeout(() => {
        onDismissedRef.current?.();
      }, PAYMENT_METHOD_SHEET_CLOSE_MS);
      return () => clearTimeout(timer);
    }
  }, [visible, amountMode, customDraft]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const payResolution = useMemo(
    () =>
      resolveTuitionPayAmountCents({
        mode: localMode,
        remainingCents,
        customDraft: localDraft,
        payRemainingYearCents:
          payRemainingYearCents > remainingCents ? payRemainingYearCents : undefined,
      }),
    [localMode, localDraft, payRemainingYearCents, remainingCents],
  );

  const taxCreditAmount =
    showTaxCreditPreset && payRemainingYearCents > remainingCents
      ? taxCreditPresetAmountCents({
          currentChargeRemainingCents: remainingCents,
          payRemainingYearCents,
        })
      : null;

  const handleSelect = (method: CheckoutPaymentMethod) => {
    if (payResolution.error) return;
    onSelect(method, payResolution.amountCents);
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  const showExtraAmountUi = amountMode === 'custom';

  return (
    <BottomSheetShell
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close payment method selection"
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.white}
      borderColor={theme.line}
      handleColor={theme.line}
      scrollContentStyle={[
        styles.sheetContent,
        keyboardInset > 0 ? { paddingBottom: keyboardInset + Spacing.four } : null,
      ]}>
      <View style={[styles.header, { borderBottomColor: theme.line }]}>
        <Text style={[styles.title, { color: theme.ink }]}>Choose payment method</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{label}</Text>
        <Text style={[styles.amount, { color: theme.ink }]}>
          {formatCents(payResolution.amountCents)}
        </Text>
      </View>

      {showExtraAmountUi ? (
        <View style={styles.amountSection}>
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setLocalMode('balance')}
              style={[
                styles.modePill,
                {
                  backgroundColor: localMode === 'balance' ? theme.primarySoft : theme.paper,
                  borderColor: localMode === 'balance' ? theme.primary : theme.line,
                },
              ]}>
              <Text
                style={[
                  styles.modeLabel,
                  { color: localMode === 'balance' ? theme.primary : theme.muted },
                ]}>
                Pay balance due
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLocalMode('custom')}
              style={[
                styles.modePill,
                {
                  backgroundColor: localMode === 'custom' ? theme.primarySoft : theme.paper,
                  borderColor: localMode === 'custom' ? theme.primary : theme.line,
                },
              ]}>
              <Text
                style={[
                  styles.modeLabel,
                  { color: localMode === 'custom' ? theme.primary : theme.muted },
                ]}>
                {EXTRA_PAY_MODE_LABEL}
              </Text>
            </Pressable>
          </View>

          {localMode === 'custom' ? (
            <TextInput
              value={localDraft}
              onChangeText={(value) => setLocalDraft(sanitizeDollarDraft(value))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.muted}
              style={[
                styles.input,
                {
                  borderColor: payResolution.error ? theme.alert : theme.line,
                  color: theme.ink,
                },
              ]}
            />
          ) : null}

          {payResolution.error ? (
            <Text style={[styles.error, { color: theme.alert }]}>{payResolution.error}</Text>
          ) : null}

          {taxCreditAmount != null ? (
            <Pressable
              onPress={() => {
                setLocalMode('custom');
                setLocalDraft(formatCentsForInput(taxCreditAmount));
              }}
              style={[styles.taxCreditPreset, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.taxCreditText, { color: theme.primary }]}>
                Apply $5,000 tax credit ({formatCents(taxCreditAmount)})
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.options}>
        <Pressable
          onPress={() => handleSelect('card')}
          disabled={loading || Boolean(payResolution.error)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.option,
            { borderColor: theme.line, backgroundColor: theme.paper },
            pressed && !loading && { opacity: 0.85 },
          ]}>
          <Ionicons name="card-outline" size={24} color={theme.primary} />
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: theme.ink }]}>
              Credit or debit card
            </Text>
            <Text style={[styles.optionBody, { color: theme.muted }]}>Pay instantly with card</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          )}
        </Pressable>

        <Pressable
          onPress={() => handleSelect('us_bank_account')}
          disabled={loading || Boolean(payResolution.error)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.option,
            { borderColor: theme.line, backgroundColor: theme.paper },
            pressed && !loading && { opacity: 0.85 },
          ]}>
          <Ionicons name="business-outline" size={24} color={theme.primary} />
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: theme.ink }]}>Bank account (ACH)</Text>
            <Text style={[styles.optionBody, { color: theme.muted }]}>
              Pay from your bank account
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          )}
        </Pressable>
      </View>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  amount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  amountSection: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  modePill: {
    borderRadius: StoryRadius.button,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: StoryRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: StoryFonts.body,
    fontSize: 16,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  taxCreditPreset: {
    borderRadius: StoryRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  taxCreditText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  options: {
    padding: Spacing.five,
    gap: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: StoryRadius.cardCompact,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  optionBody: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
