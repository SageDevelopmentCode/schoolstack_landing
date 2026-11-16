import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useParentBilling } from '@/contexts/parent-billing-context';
import { openStripeCheckout, waitBeforeStripeCheckout } from '@/lib/parent/open-stripe-checkout';
import {
  parentEnrollmentItemRoute,
  parentFormDetailRoute,
  parseEnrollmentHref,
} from '@/lib/parent/parent-nav';
import {
  createCombinedTuitionCheckout,
  createPaymentMethodSetup,
  createTuitionCheckout,
  setAutopayEnabled,
  type CheckoutPaymentMethod,
  type ParentBillingChildView,
  type ParentBillingData,
  type ParentBillingFamilySummary,
  type ParentFormListItem,
  type ParentTuitionPaymentRecord,
  type TuitionCharge,
} from '@/lib/parent/parent-portal-api';
import { isStripeCheckoutSuccess, type StripeCheckoutOutcome } from '@/lib/parent/stripe-checkout-outcome';
import {
  consumeCheckoutReturn,
  stageCheckoutBaseline,
  wasCheckoutReturnConsumed,
} from '@/lib/parent/stripe-checkout-return-handoff';
import { isPreviewSessionActive } from '@/lib/platform-admin/preview-session-store';
import {
  chargeRemainingCents,
  childFirstNameFromFullName,
  countOpenChargesOnEarliestDueDate,
  filterChargesForChild,
  filterOpenCharges,
  formatPaymentMethodLabel,
  listOpenChargesOnEarliestDueDate,
  PARENT_BILLING_AGREEMENTS_TAB,
  PARENT_BILLING_SUMMARY_TAB,
  resolveFamilyPayNowLabel,
} from '@/lib/tuition/billing-helpers';
import {
  captureCheckoutSettlementBaseline,
  runCheckoutSettlement,
  type CheckoutSettlementBaseline,
} from '@/lib/tuition/checkout-settlement';
import { formatCents } from '@/lib/tuition/format-cents';
import { pickRecentLateFeeNotice, type LateFeeNotice } from '@/lib/tuition/late-fee-notice';
import {
  buildParentBillingSetupSteps,
  type ParentBillingSetupProgress,
} from '@/lib/tuition/parent-billing-setup-steps';
import {
  buildTuitionPaymentReceiptDetail,
  resolveRelatedTuitionPayments,
  type TuitionPaymentReceiptDetail,
} from '@/lib/tuition/payment-receipt';
import {
  resolveLastPaymentDaySummary,
  type ParentLastPaymentDaySummary,
} from '@/lib/tuition/payment-summary';
import {
  formatCentsForInput,
  type TuitionPayAmountMode,
} from '@/lib/tuition/tuition-pay-amount';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type PendingPayment =
  | { type: 'single'; charge: TuitionCharge; extra?: boolean }
  | { type: 'combined'; charges: TuitionCharge[] };

/**
 * What happened, for the feedback layer to tell the parent about.
 * The controller never shows UI itself (no Alerts, no toasts).
 */
export type ParentBillingEvent =
  | { type: 'checkout_opening'; kind: 'payment' | 'card_setup' }
  | { type: 'checkout_confirming'; outcome: StripeCheckoutOutcome }
  | {
      type: 'checkout_finished';
      outcome: StripeCheckoutOutcome;
      settled: boolean;
      method: CheckoutPaymentMethod | null;
    }
  | {
      type: 'checkout_failed';
      kind: 'payment' | 'card_setup';
      message: string;
      retry: () => void;
    }
  | { type: 'autopay_updated'; enabled: boolean; methodLabel: string | null }
  | { type: 'autopay_failed'; enabled: boolean; message: string };

export type ParentBillingPayFlow = {
  open: boolean;
  label: string;
  loading: boolean;
  remainingCents: number;
  payRemainingYearCents: number;
  amountMode: TuitionPayAmountMode;
  customDraft: string;
  showTaxCreditPreset: boolean;
  close: () => void;
  onDismissed: () => void;
  confirm: (method: CheckoutPaymentMethod, amountCents: number) => void;
};

export type ParentBillingView = {
  slug: string;
  data: ParentBillingData;
  familySummary: ParentBillingFamilySummary;
  isRefreshing: boolean;
  refresh: () => void;

  activeTabKey: string;
  selectTab: (key: string) => void;
  childViews: ParentBillingChildView[];
  hasMultipleChildren: boolean;
  isSummaryTab: boolean;
  isAgreementsTab: boolean;
  activeChild: ParentBillingChildView | null;

  tuitionAgreements: ParentFormListItem[];
  hasAgreements: boolean;
  pendingAgreementCount: number;

  openCharges: TuitionCharge[];
  displayedCharges: TuitionCharge[];
  succeededPayments: ParentTuitionPaymentRecord[];
  displayedPayments: ParentTuitionPaymentRecord[];
  totalRemainingCents: number;
  nextChargeId: string | null;
  familyPayNowLabel: string;
  childPayNowLabel: string;
  childCanPayExtra: boolean;
  lastPaymentSummary: ParentLastPaymentDaySummary | null;
  setupProgress: ParentBillingSetupProgress;
  /** Student first name for a charge in the family view (null on a child tab). */
  studentNameForCharge: (charge: TuitionCharge) => string | null;

  scheduleWarningMessage: string | null;
  lateFeeNotice: LateFeeNotice | null;
  dismissLateFeeNotice: () => void;
  showAutopayFailure: boolean;
  dismissAutopayFailure: () => void;
  showTaxCreditBanner: boolean;
  dismissTaxCreditBanner: () => void;

  pay: ParentBillingPayFlow;
  payingChargeId: string | null;
  payFamily: () => void;
  payChild: () => void;
  payCharge: (chargeId: string) => void;
  payExtra: (chargeId: string) => void;

  paymentMethodLoading: boolean;
  manageCard: () => void;
  /** Turns autopay on/off. Resolves true on success. Feedback comes through events. */
  setAutopay: (enabled: boolean) => Promise<boolean>;
  onScheduleComplete: () => void;

  openEnrollment: () => void;
  openAgreement: (formId: string) => void;

  receipt: TuitionPaymentReceiptDetail | null;
  receiptOpen: boolean;
  openReceipt: (paymentId: string) => void;
  closeReceipt: () => void;
};

export type ParentBillingScreenController =
  | { status: 'loading'; error: string | null; refresh: () => void }
  | { status: 'error'; error: string; refresh: () => void }
  | { status: 'empty'; error: string | null; refresh: () => void }
  | { status: 'ready'; error: string | null; refresh: () => void; view: ParentBillingView };

export type ParentBillingScreenControllerOptions = {
  initialTab?: string;
  initialFormId?: string;
  onEvent?: (event: ParentBillingEvent) => void;
};

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

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Data, checkout and navigation for the parent Billing tab. No UI: the Garden
 * screen renders `view`, and `onEvent` tells the feedback layer what happened.
 */
export function useParentBillingScreenController(
  slug: string,
  options: ParentBillingScreenControllerOptions = {},
): ParentBillingScreenController {
  const { initialTab, initialFormId } = options;
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, refresh } = useParentBilling();
  const { reportError } = useMobileErrorReporter(data?.organizationId);

  const onEventRef = useRef(options.onEvent);
  useEffect(() => {
    onEventRef.current = options.onEvent;
  }, [options.onEvent]);
  const emit = useCallback((event: ParentBillingEvent) => onEventRef.current?.(event), []);

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

  const pendingPaymentRef = useRef<PendingPayment | null>(null);
  const paymentSheetDismissRef = useRef<(() => void) | null>(null);
  const checkoutBrowserOpenRef = useRef(false);
  const checkoutSettlementDoneRef = useRef(false);
  const checkoutMethodRef = useRef<CheckoutPaymentMethod | null>(null);
  const openedInitialFormRef = useRef(false);

  const tuitionAgreements = useMemo(() => data?.tuitionAgreements ?? [], [data?.tuitionAgreements]);
  const hasAgreements = tuitionAgreements.length > 0;
  const pendingAgreementCount = useMemo(
    () => tuitionAgreements.filter((item) => item.listStatus === 'needs_action').length,
    [tuitionAgreements],
  );

  useEffect(() => {
    if (!data) return;
    if (initialTab === PARENT_BILLING_AGREEMENTS_TAB && hasAgreements) {
      setActiveChildKey(PARENT_BILLING_AGREEMENTS_TAB);
      return;
    }
    if (data.familySummary.children.length <= 1) {
      setActiveChildKey(data.familySummary.children[0]?.childKey ?? PARENT_BILLING_SUMMARY_TAB);
      return;
    }
    setActiveChildKey(PARENT_BILLING_SUMMARY_TAB);
    // Same trigger as before the Garden migration: reset only when the family changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.familyId, hasAgreements, initialTab]);

  useEffect(() => {
    if (!initialFormId || openedInitialFormRef.current) return;
    const match = tuitionAgreements.find((item) => item.form.id === initialFormId);
    if (!match) return;
    openedInitialFormRef.current = true;
    router.push(parentFormDetailRoute(slug, initialFormId));
  }, [initialFormId, router, slug, tuitionAgreements]);

  const childViews = useMemo(() => data?.familySummary.children ?? [], [data?.familySummary.children]);
  const hasMultipleChildren = childViews.length > 1;
  const isAgreementsTab = activeChildKey === PARENT_BILLING_AGREEMENTS_TAB;
  const isSummaryTab = hasMultipleChildren && activeChildKey === PARENT_BILLING_SUMMARY_TAB;
  const activeChild =
    isSummaryTab || isAgreementsTab
      ? null
      : (childViews.find((child) => child.childKey === activeChildKey) ?? childViews[0] ?? null);

  const charges = useMemo(() => data?.charges ?? [], [data?.charges]);
  const openCharges = useMemo(() => filterOpenCharges(charges), [charges]);

  const displayedCharges = useMemo(() => {
    if (!hasMultipleChildren || isSummaryTab) return openCharges;
    return filterChargesForChild(openCharges, activeChild?.assignmentId ?? null);
  }, [activeChild?.assignmentId, hasMultipleChildren, isSummaryTab, openCharges]);

  const combinedChargesOnEarliestDueDate = useMemo(
    () => listOpenChargesOnEarliestDueDate(charges),
    [charges],
  );
  const familyPayNowLabel = resolveFamilyPayNowLabel({
    chargesOnEarliestDueDate: countOpenChargesOnEarliestDueDate(charges),
  });

  const familySummary = data?.familySummary;
  const lateFeeNotice = useMemo(() => pickRecentLateFeeNotice(charges), [charges]);
  const lastPaymentSummary = useMemo(
    () => resolveLastPaymentDaySummary(data?.payments ?? []),
    [data?.payments],
  );
  const succeededPayments = useMemo(
    () => (data?.payments ?? []).filter((payment) => payment.status === 'succeeded'),
    [data?.payments],
  );
  // Same split as before: a child view lists that child's payments, the family view all of them.
  const displayedPayments = useMemo(
    () =>
      activeChild
        ? succeededPayments.filter((payment) => payment.enrollmentId === activeChild.childKey)
        : succeededPayments,
    [activeChild, succeededPayments],
  );

  const totalRemainingCents =
    isSummaryTab || !hasMultipleChildren
      ? (familySummary?.totalRemainingCents ?? 0)
      : (activeChild?.totalRemainingCents ?? 0);

  const nextChargeId =
    isSummaryTab || !hasMultipleChildren
      ? (resolveNextChargeId(charges, familySummary?.nextCharge ?? null) ??
        familySummary?.children[0]?.nextChargeId ??
        null)
      : (activeChild?.nextChargeId ??
        resolveNextChargeId(
          filterChargesForChild(charges, activeChild?.assignmentId ?? null),
          activeChild?.nextCharge ?? null,
        ));

  const showTaxCreditBanner =
    (data?.showTaxCreditPaymentBanner ?? false) && !dismissedTaxCreditBanner && isSummaryTab;

  const pendingCharge = pendingPayment?.type === 'single' ? pendingPayment.charge : null;
  // A combined payment covers every charge on the earliest due date. Before the Garden
  // migration this was 0, which failed amount validation and blocked combined checkout.
  const pendingRemainingCents = pendingPayment
    ? pendingPayment.type === 'single'
      ? chargeRemainingCents(pendingPayment.charge)
      : pendingPayment.charges.reduce((sum, charge) => sum + chargeRemainingCents(charge), 0)
    : 0;
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

  const openPaymentSheet = useCallback((payment: PendingPayment) => {
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
  }, []);

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

  const settleCheckoutOnce = useCallback(
    async (outcome: StripeCheckoutOutcome, baseline: CheckoutSettlementBaseline) => {
      if (checkoutSettlementDoneRef.current) return;
      checkoutSettlementDoneRef.current = true;
      const method = checkoutMethodRef.current;
      if (isStripeCheckoutSuccess(outcome)) emit({ type: 'checkout_confirming', outcome });
      try {
        const result = await runCheckoutSettlement({ refresh, outcome, baseline });
        emit({ type: 'checkout_finished', outcome, settled: result.settled, method });
      } catch (settleError) {
        if (isStripeCheckoutSuccess(outcome)) {
          reportError('parent_billing_checkout_settle', settleError, {
            metadata: { outcome },
          });
          // Stripe confirmed it; only our refresh failed, so it is still processing.
          emit({ type: 'checkout_finished', outcome, settled: false, method });
        }
      }
    },
    [emit, refresh, reportError],
  );

  const trySettleFromReturnHandoff = useCallback(async () => {
    const handedOff = consumeCheckoutReturn(slug);
    if (!handedOff) return;
    const baseline = handedOff.baseline ?? captureCheckoutSettlementBaseline(data);
    await settleCheckoutOnce(handedOff.outcome, baseline);
  }, [data, settleCheckoutOnce, slug]);

  useFocusEffect(
    useCallback(() => {
      void trySettleFromReturnHandoff();
      if (isPreviewSessionActive()) {
        void refresh();
      }
    }, [refresh, trySettleFromReturnHandoff]),
  );

  const finishCheckoutSession = useCallback(
    async (sessionOutcome: StripeCheckoutOutcome, capturedBaseline: CheckoutSettlementBaseline) => {
      const handedOff = consumeCheckoutReturn(slug);
      if (handedOff) {
        const baseline = handedOff.baseline ?? capturedBaseline;
        await settleCheckoutOnce(handedOff.outcome, baseline);
        return;
      }
      if (wasCheckoutReturnConsumed(slug)) return;
      await settleCheckoutOnce(sessionOutcome, capturedBaseline);
    },
    [settleCheckoutOnce, slug],
  );

  const payFamily = () => {
    if (combinedChargesOnEarliestDueDate.length > 1) {
      openPaymentSheet({ type: 'combined', charges: combinedChargesOnEarliestDueDate });
      return;
    }
    const charge = combinedChargesOnEarliestDueDate[0];
    if (charge) {
      openPaymentSheet({ type: 'single', charge });
    }
  };

  const payChild = () => {
    if (!activeChild?.nextChargeId) return;
    const charge = charges.find((row) => row.id === activeChild.nextChargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge });
  };

  const payCharge = (chargeId: string) => {
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge });
  };

  const payExtra = (chargeId: string) => {
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge || chargeRemainingCents(charge) <= 0) return;
    openPaymentSheet({ type: 'single', charge, extra: true });
  };

  const handleConfirmPayment = async (method: CheckoutPaymentMethod, amountCents: number) => {
    const payment = pendingPaymentRef.current;
    if (!data || !payment) {
      setPaymentSheetOpen(false);
      emit({
        type: 'checkout_failed',
        kind: 'payment',
        message: 'Could not start checkout. Please try again.',
        retry: () => undefined,
      });
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
      emit({ type: 'checkout_opening', kind: 'payment' });
      await waitBeforeStripeCheckout();

      checkoutSettlementDoneRef.current = false;
      checkoutMethodRef.current = method;
      const baseline = captureCheckoutSettlementBaseline(data);
      stageCheckoutBaseline(slug, baseline);
      checkoutBrowserOpenRef.current = true;
      let outcome: StripeCheckoutOutcome;
      try {
        outcome = await openStripeCheckout(checkoutUrl);
      } finally {
        checkoutBrowserOpenRef.current = false;
      }
      await finishCheckoutSession(outcome, baseline);
    } catch (checkoutError) {
      reportError('parent_billing_checkout', checkoutError);
      // Close the sheet first: toasts render behind native modals.
      paymentSheetDismissRef.current = null;
      setPaymentSheetOpen(false);
      emit({
        type: 'checkout_failed',
        kind: 'payment',
        message: errorMessage(checkoutError, 'Failed to start checkout.'),
        retry: () => openPaymentSheet(payment),
      });
    } finally {
      setPayCheckoutLoading(false);
      setPayingChargeId(null);
      setPendingPayment(null);
      pendingPaymentRef.current = null;
      setPayAmountMode('balance');
      setPayCustomDraft('');
    }
  };

  const setAutopay = async (enabled: boolean): Promise<boolean> => {
    if (!data) return false;
    try {
      await setAutopayEnabled({
        organizationId: data.organizationId,
        familyId: data.familyId,
        enabled,
      });
      await refresh();
      emit({
        type: 'autopay_updated',
        enabled,
        methodLabel: formatPaymentMethodLabel(data.savedPaymentMethod),
      });
      return true;
    } catch (autopayError) {
      reportError('parent_billing_autopay', autopayError);
      emit({
        type: 'autopay_failed',
        enabled,
        message: errorMessage(autopayError, 'Could not update autopay.'),
      });
      return false;
    }
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

      emit({ type: 'checkout_opening', kind: 'card_setup' });
      checkoutSettlementDoneRef.current = false;
      checkoutMethodRef.current = null;
      const baseline = captureCheckoutSettlementBaseline(data);
      stageCheckoutBaseline(slug, baseline);
      checkoutBrowserOpenRef.current = true;
      let outcome: StripeCheckoutOutcome;
      try {
        outcome = await openStripeCheckout(checkoutUrl);
      } finally {
        checkoutBrowserOpenRef.current = false;
      }
      await finishCheckoutSession(outcome, baseline);
    } catch (setupError) {
      reportError('parent_billing_payment_method_setup', setupError);
      emit({
        type: 'checkout_failed',
        kind: 'card_setup',
        message: errorMessage(setupError, 'Please try again.'),
        retry: () => void handleManagePaymentMethod(),
      });
    } finally {
      setPaymentMethodLoading(false);
    }
  };

  const openEnrollment = () => {
    const href = data?.readiness.enrollmentChecklistHref;
    if (!href) return;
    const enrollment = parseEnrollmentHref(href);
    if (!enrollment) return;
    router.push(
      parentEnrollmentItemRoute(
        slug,
        enrollment.applicationId,
        enrollment.templateItemId,
        enrollment.sectionId,
      ),
    );
  };

  const receipt = useMemo(() => {
    if (!selectedPaymentId) return null;
    const related = resolveRelatedTuitionPayments(data?.payments ?? [], selectedPaymentId);
    return buildTuitionPaymentReceiptDetail(related);
  }, [data?.payments, selectedPaymentId]);

  const setupProgress = useMemo(
    () =>
      buildParentBillingSetupSteps({
        familySummary: familySummary ?? {
          balanceDueCents: 0,
          totalRemainingCents: 0,
          familyTotalRemainingCents: null,
          annualTuitionCents: 0,
          nextCharge: null,
          hasPendingSchedule: false,
          children: [],
        },
        readinessState: data?.readiness.state ?? null,
        hasAgreements,
        pendingAgreementCount,
        savedPaymentMethod: data?.savedPaymentMethod ?? null,
        autopayEnabled: data?.autopayEnabled ?? false,
      }),
    [
      data?.autopayEnabled,
      data?.readiness.state,
      data?.savedPaymentMethod,
      familySummary,
      hasAgreements,
      pendingAgreementCount,
    ],
  );

  const refreshNow = useCallback(() => void refresh(), [refresh]);

  if (isLoading && !data) return { status: 'loading', error, refresh: refreshNow };
  if (error && !data) return { status: 'error', error, refresh: refreshNow };
  if (!data || !familySummary) return { status: 'empty', error, refresh: refreshNow };

  const view: ParentBillingView = {
    slug,
    data,
    familySummary,
    isRefreshing,
    refresh: refreshNow,

    activeTabKey: activeChildKey,
    selectTab: setActiveChildKey,
    childViews,
    hasMultipleChildren,
    isSummaryTab,
    isAgreementsTab,
    activeChild,

    tuitionAgreements,
    hasAgreements,
    pendingAgreementCount,

    openCharges,
    displayedCharges,
    succeededPayments,
    displayedPayments,
    totalRemainingCents,
    nextChargeId,
    familyPayNowLabel,
    childPayNowLabel:
      activeChild && activeChild.balanceDueCents > 0
        ? `Pay ${formatCents(activeChild.balanceDueCents)}`
        : 'Pay now',
    childCanPayExtra:
      activeChild != null &&
      activeChild.nextChargeId != null &&
      activeChild.totalRemainingCents > activeChild.balanceDueCents,
    lastPaymentSummary,
    setupProgress,
    studentNameForCharge: (charge) => {
      if (!(hasMultipleChildren && isSummaryTab)) return null;
      const child = childViews.find((row) => row.assignmentId === charge.assignmentId);
      return child ? childFirstNameFromFullName(child.studentName) : null;
    },

    scheduleWarningMessage: familySummary.hasPendingSchedule
      ? 'One or more students still need a payment schedule before charges are generated.'
      : null,
    lateFeeNotice: dismissedLateFeeNotice ? null : lateFeeNotice,
    dismissLateFeeNotice: () => setDismissedLateFeeNotice(true),
    showAutopayFailure: Boolean(data.recentAutopayFailure) && !dismissedAutopayFailure,
    dismissAutopayFailure: () => setDismissedAutopayFailure(true),
    showTaxCreditBanner,
    dismissTaxCreditBanner: () => setDismissedTaxCreditBanner(true),

    pay: {
      open: paymentSheetOpen,
      label: pendingPaymentLabel,
      loading: payCheckoutLoading,
      remainingCents: pendingRemainingCents,
      payRemainingYearCents: pendingPayRemainingYearCents,
      amountMode: payAmountMode,
      customDraft: payCustomDraft,
      showTaxCreditPreset: data.showTaxCreditPaymentBanner ?? false,
      close: closePaymentSheet,
      onDismissed: handlePaymentSheetDismissed,
      confirm: (method, amountCents) => void handleConfirmPayment(method, amountCents),
    },
    payingChargeId,
    payFamily,
    payChild,
    payCharge,
    payExtra,

    paymentMethodLoading,
    manageCard: () => void handleManagePaymentMethod(),
    setAutopay,
    onScheduleComplete: refreshNow,

    openEnrollment,
    openAgreement: (formId) => router.push(parentFormDetailRoute(slug, formId)),

    receipt,
    receiptOpen,
    openReceipt: (paymentId) => {
      setSelectedPaymentId(paymentId);
      setReceiptOpen(true);
    },
    closeReceipt: () => {
      setReceiptOpen(false);
      setSelectedPaymentId(null);
    },
  };

  return { status: 'ready', error, refresh: refreshNow, view };
}
