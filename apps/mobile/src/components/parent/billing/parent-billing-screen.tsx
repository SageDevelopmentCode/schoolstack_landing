import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BILLING_PAGE_GAP } from '@/components/parent/billing/billing-layout';
import { ParentBillingAutopayFailureBanner } from '@/components/parent/billing/parent-billing-autopay-failure-banner';
import { ParentBillingChildPanel } from '@/components/parent/billing/parent-billing-child-panel';
import { ParentBillingChargeRow } from '@/components/parent/billing/parent-billing-charge-row';
import { ParentBillingChargesSheet } from '@/components/parent/billing/parent-billing-charges-sheet';
import { ParentBillingLateFeeBanner } from '@/components/parent/billing/parent-billing-late-fee-banner';
import { ParentBillingPaymentReceiptSheet } from '@/components/parent/billing/parent-billing-payment-receipt-sheet';
import { ParentBillingReadinessBanner } from '@/components/parent/billing/parent-billing-readiness-banner';
import { ParentBillingScheduleBanner } from '@/components/parent/billing/parent-billing-schedule-banner';
import { ParentBillingSkeleton } from '@/components/parent/billing/parent-billing-skeleton';
import { ParentBillingStoryHeader } from '@/components/parent/billing/parent-billing-story-header';
import { ParentBillingSummaryPanel } from '@/components/parent/billing/parent-billing-summary-panel';
import { ParentBillingTaxCreditBanner } from '@/components/parent/billing/parent-billing-tax-credit-banner';
import { ParentPaymentMethodSheet } from '@/components/parent/billing/parent-payment-method-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentBilling } from '@/contexts/parent-billing-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import {
  openStripeCheckout,
  waitBeforeStripeCheckout,
} from '@/lib/parent/open-stripe-checkout';
import {
  createCombinedTuitionCheckout,
  createPaymentMethodSetup,
  createTuitionCheckout,
  setAutopayEnabled,
  type CheckoutPaymentMethod,
  type TuitionCharge,
} from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import {
  chargeRemainingCents,
  childFirstNameFromFullName,
  countOpenChargesOnEarliestDueDate,
  filterChargesForChild,
  filterOpenCharges,
  listOpenChargesOnEarliestDueDate,
  PARENT_BILLING_SUMMARY_TAB,
  resolveFamilyPayNowLabel,
} from '@/lib/tuition/billing-helpers';
import { formatCents } from '@/lib/tuition/format-cents';
import { formatCentsForInput } from '@/lib/tuition/tuition-pay-amount';
import { pickRecentLateFeeNotice } from '@/lib/tuition/late-fee-notice';
import {
  buildTuitionPaymentReceiptDetail,
  resolveRelatedTuitionPayments,
} from '@/lib/tuition/payment-receipt';
import { resolveLastPaymentDaySummary } from '@/lib/tuition/payment-summary';
import type { TuitionPayAmountMode } from '@/lib/tuition/tuition-pay-amount';

type ParentBillingScreenProps = {
  slug: string;
};

type PendingPayment =
  | { type: 'single'; charge: TuitionCharge; extra?: boolean }
  | { type: 'combined'; charges: TuitionCharge[] };

function resolveNextChargeId(
  charges: TuitionCharge[],
  nextCharge: { dueDate: string; label: string } | null,
): string | null {
  if (!nextCharge) return null;
  const match = charges.find(
    (charge) =>
      charge.dueDate === nextCharge.dueDate &&
      charge.label === nextCharge.label &&
      chargeRemainingCents(charge) > 0,
  );
  return match?.id ?? null;
}

export function ParentBillingScreen({ slug }: ParentBillingScreenProps) {
  const theme = useParentTheme();
  const { data, isLoading, isRefreshing, error, refresh } = useParentBilling();
  const { reportError } = useMobileErrorReporter(data?.organizationId);

  const [activeChildKey, setActiveChildKey] = useState(PARENT_BILLING_SUMMARY_TAB);
  const [dismissedAutopayFailure, setDismissedAutopayFailure] = useState(false);
  const [dismissedLateFeeNotice, setDismissedLateFeeNotice] = useState(false);
  const [dismissedTaxCreditBanner, setDismissedTaxCreditBanner] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [payAmountMode, setPayAmountMode] = useState<TuitionPayAmountMode>('balance');
  const [payCustomDraft, setPayCustomDraft] = useState('');
  const [payCheckoutLoading, setPayCheckoutLoading] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [payingChargeId, setPayingChargeId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [chargesSheetOpen, setChargesSheetOpen] = useState(false);

  const pendingPaymentRef = useRef<PendingPayment | null>(null);
  const paymentSheetDismissRef = useRef<(() => void) | null>(null);
  const checkoutBrowserOpenRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    if (data.familySummary.children.length <= 1) {
      setActiveChildKey(data.familySummary.children[0]?.childKey ?? PARENT_BILLING_SUMMARY_TAB);
      return;
    }
    setActiveChildKey(PARENT_BILLING_SUMMARY_TAB);
  }, [data?.familyId]);

  useEffect(() => {
    setChargesSheetOpen(false);
  }, [activeChildKey]);

  const childViews = data?.familySummary.children ?? [];
  const hasMultipleChildren = childViews.length > 1;
  const isSummaryTab = hasMultipleChildren && activeChildKey === PARENT_BILLING_SUMMARY_TAB;
  const activeChild = isSummaryTab
    ? null
    : (childViews.find((child) => child.childKey === activeChildKey) ?? childViews[0] ?? null);

  const charges = data?.charges ?? [];
  const openCharges = useMemo(() => filterOpenCharges(charges), [charges]);

  const displayedCharges = useMemo(() => {
    if (!hasMultipleChildren || isSummaryTab) return openCharges;
    return filterChargesForChild(openCharges, activeChild?.assignmentId ?? null);
  }, [activeChild?.assignmentId, hasMultipleChildren, isSummaryTab, openCharges]);

  const combinedChargesOnEarliestDueDate = useMemo(
    () => listOpenChargesOnEarliestDueDate(charges),
    [charges],
  );

  const chargesOnEarliestDueDate = countOpenChargesOnEarliestDueDate(charges);
  const familyPayNowLabel = resolveFamilyPayNowLabel({ chargesOnEarliestDueDate });

  const familySummary = data?.familySummary;
  const lateFeeNotice = useMemo(() => pickRecentLateFeeNotice(charges), [charges]);
  const lastPaymentSummary = useMemo(
    () => resolveLastPaymentDaySummary(data?.payments ?? []),
    [data?.payments],
  );

  const totalRemainingCents = isSummaryTab || !hasMultipleChildren
    ? (familySummary?.totalRemainingCents ?? 0)
    : (activeChild?.totalRemainingCents ?? 0);

  const nextChargeId = isSummaryTab || !hasMultipleChildren
    ? resolveNextChargeId(charges, familySummary?.nextCharge ?? null) ??
      familySummary?.children[0]?.nextChargeId ??
      null
    : (activeChild?.nextChargeId ??
      resolveNextChargeId(
        filterChargesForChild(charges, activeChild?.assignmentId ?? null),
        activeChild?.nextCharge ?? null,
      ));

  const showTaxCreditBanner =
    (data?.showTaxCreditPaymentBanner ?? false) && !dismissedTaxCreditBanner && isSummaryTab;

  const pendingCharge = pendingPayment?.type === 'single' ? pendingPayment.charge : null;
  const pendingRemainingCents = pendingCharge ? chargeRemainingCents(pendingCharge) : 0;
  const pendingPayRemainingYearCents = useMemo(() => {
    if (!pendingCharge || !data) return 0;
    const child = childViews.find((row) => row.assignmentId === pendingCharge.assignmentId);
    return child?.totalRemainingCents ?? familySummary?.totalRemainingCents ?? 0;
  }, [childViews, data, familySummary?.totalRemainingCents, pendingCharge]);

  const pendingPaymentLabel = useMemo(() => {
    if (!pendingPayment) return 'Tuition payment';
    if (pendingPayment.type === 'combined') {
      return `Combined payment (${pendingPayment.charges.length} charges)`;
    }
    const charge = pendingPayment.charge;
    const child = childViews.find((row) => row.assignmentId === charge.assignmentId);
    const studentName = child ? childFirstNameFromFullName(child.studentName) : null;
    return studentName ? `${studentName} — ${charge.label}` : charge.label;
  }, [childViews, pendingPayment]);

  const openPaymentSheet = (payment: PendingPayment) => {
    pendingPaymentRef.current = payment;
    setPendingPayment(payment);
    if (payment.type === 'single' && payment.extra) {
      setPayAmountMode('custom');
      setPayCustomDraft(formatCentsForInput(chargeRemainingCents(payment.charge)));
    } else {
      setPayAmountMode('balance');
      setPayCustomDraft('');
    }
    setPaymentSheetOpen(true);
  };

  const closePaymentSheet = () => {
    if (payCheckoutLoading) return;
    paymentSheetDismissRef.current = null;
    setPaymentSheetOpen(false);
    setPendingPayment(null);
    pendingPaymentRef.current = null;
    setPayingChargeId(null);
    setPayAmountMode('balance');
    setPayCustomDraft('');
  };

  const waitForPaymentSheetDismiss = useCallback(() => {
    return new Promise<void>((resolve) => {
      paymentSheetDismissRef.current = resolve;
      setPaymentSheetOpen(false);
    });
  }, []);

  const handlePaymentSheetDismissed = useCallback(() => {
    paymentSheetDismissRef.current?.();
    paymentSheetDismissRef.current = null;
  }, []);

  const handleFamilyPay = () => {
    if (combinedChargesOnEarliestDueDate.length > 1) {
      openPaymentSheet({ type: 'combined', charges: combinedChargesOnEarliestDueDate });
      return;
    }
    const charge = combinedChargesOnEarliestDueDate[0];
    if (charge) {
      openPaymentSheet({ type: 'single', charge });
    }
  };

  const handleChildPay = () => {
    if (!activeChild?.nextChargeId) return;
    const charge = charges.find((row) => row.id === activeChild.nextChargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge });
  };

  const handlePayCharge = (chargeId: string) => {
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge });
  };

  const handlePayExtra = (chargeId: string) => {
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge, extra: true });
  };

  const handleConfirmPayment = async (method: CheckoutPaymentMethod, amountCents: number) => {
    const payment = pendingPaymentRef.current;
    if (!data || !payment) {
      Alert.alert('Payment failed', 'Could not start checkout. Please try again.');
      return;
    }

    if (checkoutBrowserOpenRef.current) return;

    setPayCheckoutLoading(true);
    try {
      let checkoutUrl: string | undefined;

      if (payment.type === 'combined') {
        const result = await createCombinedTuitionCheckout({
          chargeIds: payment.charges.map((charge) => charge.id),
          paymentMethod: method,
          orgSlug: slug,
        });
        checkoutUrl = result.checkoutUrl;
      } else {
        setPayingChargeId(payment.charge.id);
        const remainingCents = chargeRemainingCents(payment.charge);
        const result = await createTuitionCheckout(payment.charge.id, {
          paymentMethod: method,
          orgSlug: slug,
          amountCents: amountCents > remainingCents ? amountCents : undefined,
        });
        checkoutUrl = result.checkoutUrl;
      }

      if (!checkoutUrl) {
        throw new Error('Failed to start checkout.');
      }

      await waitForPaymentSheetDismiss();
      await waitBeforeStripeCheckout();

      checkoutBrowserOpenRef.current = true;
      try {
        await openStripeCheckout(checkoutUrl);
        await refresh();
      } finally {
        checkoutBrowserOpenRef.current = false;
      }
    } catch (checkoutError) {
      reportError('parent_billing_checkout', checkoutError);
      Alert.alert(
        'Payment failed',
        checkoutError instanceof Error ? checkoutError.message : 'Failed to start checkout.',
      );
    } finally {
      setPayCheckoutLoading(false);
      setPayingChargeId(null);
      setPendingPayment(null);
      pendingPaymentRef.current = null;
      setPayAmountMode('balance');
      setPayCustomDraft('');
    }
  };

  const renderChargeRow = (charge: TuitionCharge) => {
    const child = childViews.find((row) => row.assignmentId === charge.assignmentId);
    return (
      <ParentBillingChargeRow
        charge={charge}
        studentName={
          hasMultipleChildren && isSummaryTab
            ? child
              ? childFirstNameFromFullName(child.studentName)
              : null
            : null
        }
        autopayEnabled={data?.autopayEnabled ?? false}
        onPay={() => handlePayCharge(charge.id)}
        paying={payingChargeId === charge.id}
      />
    );
  };

  const handleAutopayToggle = (enabled: boolean) => {
    if (!data) return;

    Alert.alert(
      enabled ? 'Enable autopay?' : 'Turn off autopay?',
      enabled
        ? 'Due charges will be paid automatically with your saved payment method.'
        : 'You will need to pay each charge manually.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: enabled ? 'Enable' : 'Turn off',
          onPress: async () => {
            try {
              await setAutopayEnabled({
                organizationId: data.organizationId,
                familyId: data.familyId,
                enabled,
              });
              await refresh();
            } catch (autopayError) {
              reportError('parent_billing_autopay', autopayError);
              Alert.alert(
                'Autopay update failed',
                autopayError instanceof Error
                  ? autopayError.message
                  : 'Could not update autopay.',
              );
            }
          },
        },
      ],
    );
  };

  const handleManagePaymentMethod = async () => {
    if (!data || checkoutBrowserOpenRef.current) return;

    setPaymentMethodLoading(true);
    try {
      const { checkoutUrl } = await createPaymentMethodSetup({
        organizationId: data.organizationId,
        familyId: data.familyId,
        orgSlug: slug,
      });

      if (!checkoutUrl) {
        throw new Error('Failed to start card setup.');
      }

      checkoutBrowserOpenRef.current = true;
      try {
        await openStripeCheckout(checkoutUrl);
        await refresh();
      } finally {
        checkoutBrowserOpenRef.current = false;
      }
    } catch (setupError) {
      reportError('parent_billing_payment_method_setup', setupError);
      Alert.alert(
        'Could not open card setup',
        setupError instanceof Error ? setupError.message : 'Please try again.',
      );
    } finally {
      setPaymentMethodLoading(false);
    }
  };

  const handleOpenEnrollment = async () => {
    const href = data?.readiness.enrollmentChecklistHref;
    if (!href) return;
    await openBrowserAsync(resolveWebUrl(href), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const selectedReceipt = useMemo(() => {
    if (!selectedPaymentId) return null;
    const related = resolveRelatedTuitionPayments(data?.payments ?? [], selectedPaymentId);
    return buildTuitionPaymentReceiptDetail(related);
  }, [data?.payments, selectedPaymentId]);

  const scheduleWarningMessage = familySummary?.hasPendingSchedule
    ? 'One or more students still need a payment schedule before charges are generated.'
    : null;

  if (isLoading && !data) {
    return <ParentBillingSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={{ color: theme.muted, textAlign: 'center' }}>{error}</Text>
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data || !familySummary) return null;

  return (
    <>
      <ScrollView
        style={{ backgroundColor: Story.paper }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }>
        <ParentBillingStoryHeader
          activeTabKey={
            hasMultipleChildren
              ? activeChildKey
              : (childViews[0]?.childKey ?? PARENT_BILLING_SUMMARY_TAB)
          }
          childViews={childViews}
          openChargeCount={openCharges.length}
          totalRemainingCents={totalRemainingCents}
          onSelectTab={setActiveChildKey}
        />

        {scheduleWarningMessage ? (
          <ParentBillingScheduleBanner message={scheduleWarningMessage} />
        ) : null}

        <ParentBillingReadinessBanner
          readiness={data.readiness}
          hasCharges={charges.length > 0}
          hasPendingSchedule={familySummary.hasPendingSchedule}
          onOpenEnrollment={handleOpenEnrollment}
        />

        {lateFeeNotice && !dismissedLateFeeNotice ? (
          <ParentBillingLateFeeBanner
            notice={lateFeeNotice}
            onDismiss={() => setDismissedLateFeeNotice(true)}
          />
        ) : null}

        {data.recentAutopayFailure && !dismissedAutopayFailure ? (
          <ParentBillingAutopayFailureBanner
            summary={data.recentAutopayFailure.summary}
            onDismiss={() => setDismissedAutopayFailure(true)}
          />
        ) : null}

        {showTaxCreditBanner ? (
          <ParentBillingTaxCreditBanner
            chargeId={nextChargeId}
            onDismiss={() => setDismissedTaxCreditBanner(true)}
            onApplyTaxCredit={handlePayExtra}
          />
        ) : null}

        <Animated.View key={activeChildKey} entering={FadeIn.duration(220)}>
          {isSummaryTab ? (
            <ParentBillingSummaryPanel
              summary={familySummary}
              childViews={childViews}
              payments={(data.payments ?? []).filter((payment) => payment.status === 'succeeded')}
              charges={openCharges}
              autopayEnabled={data.autopayEnabled}
              savedPaymentMethod={data.savedPaymentMethod}
              paymentMethodLoading={paymentMethodLoading}
              familyPayNowLabel={familyPayNowLabel}
              nextChargeId={nextChargeId}
              lastPaymentSummary={lastPaymentSummary}
              paying={payCheckoutLoading}
              onPay={handleFamilyPay}
              onAutopayToggleRequest={handleAutopayToggle}
              onManagePaymentMethod={() => void handleManagePaymentMethod()}
              onSelectChild={setActiveChildKey}
              onPaymentClick={(paymentId) => {
                setSelectedPaymentId(paymentId);
                setReceiptOpen(true);
              }}
              renderChargeRow={renderChargeRow}
              onShowAllCharges={() => setChargesSheetOpen(true)}
            />
          ) : activeChild ? (
            <ParentBillingChildPanel
              child={activeChild}
              charges={displayedCharges}
              payments={(data.payments ?? []).filter((payment) => payment.status === 'succeeded')}
              autopayEnabled={data.autopayEnabled}
              savedPaymentMethod={data.savedPaymentMethod}
              paymentMethodLoading={paymentMethodLoading}
              payNowLabel={
                activeChild.balanceDueCents > 0
                  ? `Pay ${formatCents(activeChild.balanceDueCents)}`
                  : 'Pay now'
              }
              lastPaymentSummary={lastPaymentSummary}
              paying={payCheckoutLoading}
              onPay={handleChildPay}
              onPayExtra={() => {
                if (activeChild.nextChargeId) {
                  handlePayExtra(activeChild.nextChargeId);
                }
              }}
              onAutopayToggleRequest={handleAutopayToggle}
              onManagePaymentMethod={() => void handleManagePaymentMethod()}
              onScheduleComplete={() => void refresh()}
              onPaymentClick={(paymentId) => {
                setSelectedPaymentId(paymentId);
                setReceiptOpen(true);
              }}
              renderChargeRow={renderChargeRow}
              onShowAllCharges={() => setChargesSheetOpen(true)}
            />
          ) : null}
        </Animated.View>
      </ScrollView>

      <ParentPaymentMethodSheet
        visible={paymentSheetOpen}
        label={pendingPaymentLabel}
        loading={payCheckoutLoading}
        remainingCents={pendingRemainingCents}
        payRemainingYearCents={pendingPayRemainingYearCents}
        amountMode={payAmountMode}
        customDraft={payCustomDraft}
        showTaxCreditPreset={data.showTaxCreditPaymentBanner ?? false}
        onClose={closePaymentSheet}
        onDismissed={handlePaymentSheetDismissed}
        onSelect={(method, amountCents) => void handleConfirmPayment(method, amountCents)}
      />

      <ParentBillingChargesSheet
        visible={chargesSheetOpen}
        charges={displayedCharges}
        onClose={() => setChargesSheetOpen(false)}
        renderChargeRow={renderChargeRow}
      />

      <ParentBillingPaymentReceiptSheet
        visible={receiptOpen}
        receipt={selectedReceipt}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: BILLING_PAGE_GAP,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  retry: {
    marginTop: Spacing.three,
    maxWidth: 200,
  },
});
