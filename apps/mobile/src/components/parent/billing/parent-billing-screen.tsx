import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ParentBillingBalanceHero } from '@/components/parent/billing/parent-billing-balance-hero';
import { ParentBillingChargeRow } from '@/components/parent/billing/parent-billing-charge-row';
import { ParentBillingChargesSheet } from '@/components/parent/billing/parent-billing-charges-sheet';
import { ParentBillingChildPicker } from '@/components/parent/billing/parent-billing-child-picker';
import { ParentBillingExpandableSection } from '@/components/parent/billing/parent-billing-expandable-section';
import { ParentBillingPaymentHistoryRow } from '@/components/parent/billing/parent-billing-payment-history-row';
import { ParentBillingPaymentReceiptSheet } from '@/components/parent/billing/parent-billing-payment-receipt-sheet';
import { ParentBillingReadinessBanner } from '@/components/parent/billing/parent-billing-readiness-banner';
import { ParentBillingSettingsCard } from '@/components/parent/billing/parent-billing-settings-card';
import { ParentBillingSkeleton } from '@/components/parent/billing/parent-billing-skeleton';
import { ParentPaymentMethodSheet } from '@/components/parent/billing/parent-payment-method-sheet';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentBilling } from '@/contexts/parent-billing-context';
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
import {
  buildTuitionPaymentReceiptDetail,
  resolveRelatedTuitionPayments,
} from '@/lib/tuition/payment-receipt';

type ParentBillingScreenProps = {
  slug: string;
};

type PendingPayment =
  | { type: 'single'; charge: TuitionCharge }
  | { type: 'combined'; charges: TuitionCharge[] };

export function ParentBillingScreen({ slug }: ParentBillingScreenProps) {
  const theme = useAdminTheme();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useParentBilling();

  useLayoutEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const [activeChildKey, setActiveChildKey] = useState(PARENT_BILLING_SUMMARY_TAB);
  const [dismissedAutopayFailure, setDismissedAutopayFailure] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [payCheckoutLoading, setPayCheckoutLoading] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [payingChargeId, setPayingChargeId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [chargesSheetOpen, setChargesSheetOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const pendingPaymentRef = useRef<PendingPayment | null>(null);
  const paymentSheetDismissRef = useRef<(() => void) | null>(null);
  const checkoutBrowserOpenRef = useRef(false);

  useEffect(() => {
    setHistoryExpanded(false);
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
  const balanceDueCents = isSummaryTab || !hasMultipleChildren
    ? (familySummary?.balanceDueCents ?? 0)
    : (activeChild?.balanceDueCents ?? 0);
  const totalRemainingCents = isSummaryTab || !hasMultipleChildren
    ? (familySummary?.totalRemainingCents ?? 0)
    : (activeChild?.totalRemainingCents ?? 0);
  const nextCharge =
    isSummaryTab || !hasMultipleChildren
      ? (familySummary?.nextCharge ?? null)
      : (activeChild?.nextCharge ?? null);

  const succeededPayments = useMemo(
    () => (data?.payments ?? []).filter((payment) => payment.status === 'succeeded'),
    [data?.payments],
  );

  const selectedReceipt = useMemo(() => {
    if (!selectedPaymentId) return null;
    const related = resolveRelatedTuitionPayments(data?.payments ?? [], selectedPaymentId);
    return buildTuitionPaymentReceiptDetail(related);
  }, [data?.payments, selectedPaymentId]);

  const pendingPaymentAmount = useMemo(() => {
    if (!pendingPayment) return 0;
    if (pendingPayment.type === 'combined') {
      return pendingPayment.charges.reduce((sum, charge) => sum + chargeRemainingCents(charge), 0);
    }
    return chargeRemainingCents(pendingPayment.charge);
  }, [pendingPayment]);

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
    setPaymentSheetOpen(true);
  };

  const closePaymentSheet = () => {
    if (payCheckoutLoading) return;
    paymentSheetDismissRef.current = null;
    setPaymentSheetOpen(false);
    setPendingPayment(null);
    pendingPaymentRef.current = null;
    setPayingChargeId(null);
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

  const handlePayCharge = (chargeId: string) => {
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge });
  };

  const handleConfirmPayment = async (method: CheckoutPaymentMethod) => {
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
        const result = await createTuitionCheckout(payment.charge.id, {
          paymentMethod: method,
          orgSlug: slug,
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
      Alert.alert(
        'Payment failed',
        checkoutError instanceof Error ? checkoutError.message : 'Failed to start checkout.',
      );
    } finally {
      setPayCheckoutLoading(false);
      setPayingChargeId(null);
      setPendingPayment(null);
      pendingPaymentRef.current = null;
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

  if (isLoading && !data) {
    return <ParentBillingSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <Pressable onPress={() => void refresh()} style={{ marginTop: Spacing.three }}>
          <ThemedText style={{ color: theme.accent }}>Try again</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (!data) return null;

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.bg }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.accent}
          />
        }>
        <ParentBillingChildPicker
          children={childViews}
          activeKey={
            hasMultipleChildren
              ? activeChildKey
              : (childViews[0]?.childKey ?? PARENT_BILLING_SUMMARY_TAB)
          }
          onChange={setActiveChildKey}
        />

        <ParentBillingBalanceHero
          balanceDueCents={balanceDueCents}
          totalRemainingCents={totalRemainingCents}
          familyTotalRemainingCents={familySummary?.familyTotalRemainingCents ?? null}
          nextCharge={nextCharge}
          payLabel={familyPayNowLabel}
          onPay={handleFamilyPay}
          paying={payCheckoutLoading}
          disabled={balanceDueCents <= 0}
        />

        <ParentBillingReadinessBanner
          readiness={data.readiness}
          hasCharges={charges.length > 0}
          hasPendingSchedule={familySummary?.hasPendingSchedule ?? false}
          onOpenEnrollment={handleOpenEnrollment}
        />

        {data.recentAutopayFailure && !dismissedAutopayFailure ? (
          <View
            style={[
              styles.alertBanner,
              { backgroundColor: theme.errorBg, borderColor: `${theme.error}33` },
            ]}>
            <Ionicons name="alert-circle-outline" size={20} color={theme.error} />
            <View style={styles.alertText}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Autopay failed
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                {data.recentAutopayFailure.summary}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setDismissedAutopayFailure(true)}
              accessibilityLabel="Dismiss autopay failure">
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        ) : null}

        <ParentBillingExpandableSection
          title="Upcoming charges"
          items={displayedCharges}
          onShowAll={() => setChargesSheetOpen(true)}
          emptyMessage="No open charges"
          keyExtractor={(charge) => charge.id}
          renderItem={renderChargeRow}
        />

        <ParentBillingExpandableSection
          title="Payment history"
          items={succeededPayments}
          expanded={historyExpanded}
          onToggleExpanded={() => setHistoryExpanded((value) => !value)}
          emptyMessage="No payments yet"
          keyExtractor={(payment) => payment.id}
          renderItem={(payment) => (
            <ParentBillingPaymentHistoryRow
              payment={payment}
              onPress={() => {
                setSelectedPaymentId(payment.id);
                setReceiptOpen(true);
              }}
            />
          )}
        />

        <View style={styles.section}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Payment settings
          </ThemedText>
          <ParentBillingSettingsCard
            autopayEnabled={data.autopayEnabled}
            savedPaymentMethod={data.savedPaymentMethod}
            paymentMethodLoading={paymentMethodLoading}
            onAutopayToggle={handleAutopayToggle}
            onManagePaymentMethod={() => void handleManagePaymentMethod()}
          />
        </View>
      </ScrollView>

      <ParentPaymentMethodSheet
        visible={paymentSheetOpen}
        amountCents={pendingPaymentAmount}
        label={pendingPaymentLabel}
        loading={payCheckoutLoading}
        onClose={closePaymentSheet}
        onDismissed={handlePaymentSheetDismissed}
        onSelect={(method) => void handleConfirmPayment(method)}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  alertText: {
    flex: 1,
  },
});
