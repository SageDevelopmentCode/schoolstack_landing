"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, CircleAlert, Loader2 } from "lucide-react";
import ParentBillingUpcomingChargesPanel, {
  formatUpcomingChargesSummary,
} from "@/components/school-parent/billing/ParentBillingUpcomingChargesPanel";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingPaymentReceiptPanel from "@/components/school-parent/billing/ParentBillingPaymentReceiptPanel";
import ParentBillingChildTabs from "@/components/school-parent/billing/ParentBillingChildTabs";
import ParentBillingSummaryCard from "@/components/school-parent/billing/ParentBillingSummaryCard";
import ParentBillingChildDetailModal from "@/components/school-parent/billing/ParentBillingChildDetailModal";
import ParentAutopayConfirmModal from "@/components/school-parent/billing/ParentAutopayConfirmModal";
import ParentPaymentMethodCard from "@/components/school-parent/billing/ParentPaymentMethodCard";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import TuitionPayAmountField, {
  resolveTuitionPayAmountCents,
  type TuitionPayAmountMode,
} from "@/components/school-parent/billing/TuitionPayAmountField";
import PaymentMethodSelectionModal from "@/components/admissions/PaymentMethodSelectionModal";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamily,
} from "@/lib/tuition/charges";
import { chargeRemainingCents, listBillingSplits } from "@/lib/tuition/billing-splits";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import {
  listParentTuitionPaymentHistory,
  resolveLastPaymentDaySummary,
} from "@/lib/tuition/payments";
import { buildStudentColorIndexMap } from "@/lib/tuition/student-badge-colors";
import {
  buildTuitionPaymentReceiptDetail,
  resolveRelatedTuitionPayments,
} from "@/lib/tuition/tuition-payment-receipt-detail";
import { formatCents } from "@/lib/tuition/pricing";
import { pickRecentLateFeeNotice } from "@/lib/tuition/late-fee-notice";
import { formatCentsForInput } from "@/lib/admissions/application-form-schema";
import {
  getAutopayEnabledForGuardian,
} from "@/lib/tuition/payment-settlement";
import {
  getDefaultPaymentMethodForGuardian,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import {
  childFirstNameFromFullName,
  countOpenChargesOnEarliestDueDate,
  fetchParentBillingFamilySummary,
  listOpenChargesOnEarliestDueDate,
  pickInitialChildKey,
  pickNextPendingChildKey,
  resolveFamilyPayNowLabel,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import {
  fetchFamilyBillingReadiness,
  type FamilyBillingReadiness,
} from "@/lib/tuition/tuition-readiness";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { TuitionCharge, TuitionAdjustment } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import { getAssignmentPaymentContext } from "@/lib/tuition/family-checklist-responses";
import { EXTRA_PAY_BANNER_CTA } from "@/lib/tuition/tuition-pay-copy";
import { createClient } from "@/utils/supabase/client";

type ParentBillingPageProps = {
  organizationId: string;
  familyId: string;
  branding: OrganizationBranding;
  slug: string;
  previewMode?: boolean;
  initialData?: ParentBillingInitialData;
};

function ParentBillingPageFallback({
  branding,
}: {
  branding: OrganizationBranding;
}) {
  const C = buildAdminThemeTokens(branding);
  return (
    <div
      className="flex items-center justify-center gap-2 p-6 text-sm"
      style={{ color: C.textSecondary }}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading billing…
    </div>
  );
}

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function ParentBillingPageContent({
  organizationId,
  familyId,
  branding,
  slug,
  previewMode = false,
  initialData,
}: ParentBillingPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkChargeId = searchParams.get("charge");
  const cardSaved = searchParams.get("card_saved");
  const hasInitialData = initialData !== undefined;

  const [charges, setCharges] = useState<TuitionCharge[]>(initialData?.charges ?? []);
  const [payments, setPayments] = useState<ParentTuitionPaymentRecord[]>(
    initialData?.payments ?? [],
  );
  const [adjustments, setAdjustments] = useState<TuitionAdjustment[]>(
    initialData?.adjustments ?? [],
  );
  const [autopayEnabled, setAutopayEnabledState] = useState(
    initialData?.autopayEnabled ?? false,
  );
  const [savedPaymentMethod, setSavedPaymentMethod] = useState<SavedPaymentMethodSummary | null>(
    initialData?.savedPaymentMethod ?? null,
  );
  const [recentAutopayFailure, setRecentAutopayFailure] = useState(
    initialData?.recentAutopayFailure ?? null,
  );
  const [dismissedAutopayFailure, setDismissedAutopayFailure] = useState(false);
  const [dismissedLateFeeNotice, setDismissedLateFeeNotice] = useState(false);
  const [payAmountMode, setPayAmountMode] = useState<TuitionPayAmountMode>("balance");
  const [payCustomDraft, setPayCustomDraft] = useState("");
  const [autopayModalOpen, setAutopayModalOpen] = useState(false);
  const [pendingAutopayEnabled, setPendingAutopayEnabled] = useState(false);
  const [autopaySaving, setAutopaySaving] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [guardianId] = useState<string | null>(initialData?.guardianId ?? null);
  const [hasBillingSplit] = useState(initialData?.hasBillingSplit ?? false);
  const [loading, setLoading] = useState(!hasInitialData);
  const [payingChargeId, setPayingChargeId] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPayCharge, setPendingPayCharge] = useState<TuitionCharge | null>(null);
  const [pendingPayCharges, setPendingPayCharges] = useState<TuitionCharge[] | null>(null);
  const [payCheckoutLoading, setPayCheckoutLoading] = useState(false);
  const [payingCombined, setPayingCombined] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [detailModalChildKey, setDetailModalChildKey] = useState<string | null>(null);
  const [manualUpcomingChargesPanelOpen, setManualUpcomingChargesPanelOpen] = useState(false);
  const [paymentReceiptPanelOpen, setPaymentReceiptPanelOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [dismissedDeepLinkChargeId, setDismissedDeepLinkChargeId] = useState<string | null>(null);
  const [highlightedChargeId, setHighlightedChargeId] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<FamilyBillingReadiness | null>(
    initialData?.readiness ?? null,
  );
  const [familySummary, setFamilySummary] = useState<ParentBillingFamilySummary | null>(
    initialData?.familySummary ?? null,
  );
  const [activeChildKey, setActiveChildKey] = useState<string | null>(
    initialData?.initialChildKey ?? null,
  );
  const [showTaxCreditPaymentBanner] = useState(
    initialData?.showTaxCreditPaymentBanner ?? false,
  );
  const [dismissedTaxCreditBanner, setDismissedTaxCreditBanner] = useState(false);

  const adjustmentsByAssignment = useMemo(() => {
    const map = new Map<string, TuitionAdjustment[]>();
    for (const adjustment of adjustments) {
      const existing = map.get(adjustment.assignmentId) ?? [];
      existing.push(adjustment);
      map.set(adjustment.assignmentId, existing);
    }
    return map;
  }, [adjustments]);

  const lateFeeNotice = useMemo(
    () => pickRecentLateFeeNotice(charges),
    [charges],
  );

  const lastPaymentSummary = useMemo(
    () => resolveLastPaymentDaySummary(payments),
    [payments],
  );

  const pendingPayResolution = useMemo(() => {
    if (pendingPayCharges && pendingPayCharges.length > 0) {
      const totalCents = pendingPayCharges.reduce(
        (sum, charge) => sum + chargeRemainingCents(charge),
        0,
      );
      return { amountCents: totalCents, error: null as string | null };
    }

    if (!pendingPayCharge) {
      return { amountCents: 0, error: null as string | null };
    }

    const { payRemainingYearCents } = getAssignmentPaymentContext(
      charges,
      pendingPayCharge.assignmentId,
      pendingPayCharge.id,
    );

    return resolveTuitionPayAmountCents({
      mode: payAmountMode,
      remainingCents: chargeRemainingCents(pendingPayCharge),
      customDraft: payCustomDraft,
      payRemainingYearCents:
        payRemainingYearCents > chargeRemainingCents(pendingPayCharge)
          ? payRemainingYearCents
          : undefined,
    });
  }, [charges, pendingPayCharge, pendingPayCharges, payAmountMode, payCustomDraft]);

  const combinedPaymentLineItems = useMemo(() => {
    if (!pendingPayCharges?.length || !familySummary) return undefined;

    return pendingPayCharges.map((charge) => {
      const child = familySummary.children.find(
        (row) => row.assignmentId === charge.assignmentId,
      );
      const studentName = child
        ? childFirstNameFromFullName(child.studentName)
        : "Student";

      return {
        id: charge.id,
        label: `${studentName} — ${charge.label}`,
        amountCents: chargeRemainingCents(charge),
      };
    });
  }, [pendingPayCharges, familySummary]);

  const singlePayModalLabel = useMemo(() => {
    if (!pendingPayCharge) return "Tuition payment";
    if (!familySummary) return pendingPayCharge.label;

    const child = familySummary.children.find(
      (row) => row.assignmentId === pendingPayCharge.assignmentId,
    );
    const studentName = child
      ? childFirstNameFromFullName(child.studentName)
      : null;
    return studentName
      ? `${studentName} — ${pendingPayCharge.label}`
      : pendingPayCharge.label;
  }, [pendingPayCharge, familySummary]);

  const loadBilling = useCallback(async (): Promise<ParentBillingFamilySummary | null> => {
    setLoading(true);
    try {
      const billingSplits = await listBillingSplits(supabase, familyId);
      const splitActive = billingSplits.length > 0;
      const [allChargeRows, paymentRows, adjustmentRows, readinessState] =
        await Promise.all([
          listChargesForFamily(supabase, familyId),
          listParentTuitionPaymentHistory(supabase, familyId),
          listAdjustmentsForFamily(supabase, familyId),
          fetchFamilyBillingReadiness(supabase, {
            organizationId,
            familyId,
            slug,
          }),
        ]);

      const chargeRows = filterChargesForFamilyGuardian(
        allChargeRows,
        guardianId,
        { hasBillingSplit: splitActive },
      );

      const summary = await fetchParentBillingFamilySummary(supabase, {
        organizationId,
        familyId,
        charges: chargeRows,
        allFamilyCharges: splitActive ? allChargeRows : undefined,
      });

      setCharges(chargeRows);
      setPayments(paymentRows);
      setAdjustments(adjustmentRows);
      setReadiness(readinessState);
      setFamilySummary(summary);
      setActiveChildKey((prev) => {
        if (prev && summary.children.some((child) => child.childKey === prev)) {
          return prev;
        }
        return pickInitialChildKey(summary.children);
      });

      const { data: account } = await supabase
        .from("tuition_billing_accounts")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("family_id", familyId)
        .maybeSingle();

      const billingAccount = account ? rowToBillingAccount(account) : null;
      setAutopayEnabledState(
        billingAccount
          ? getAutopayEnabledForGuardian(billingAccount, guardianId)
          : false,
      );

      if (billingAccount) {
        const method = await getDefaultPaymentMethodForGuardian(supabase, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        });
        setSavedPaymentMethod(method);
      } else {
        setSavedPaymentMethod(null);
      }

      return summary;
    } finally {
      setLoading(false);
    }
  }, [familyId, guardianId, organizationId, slug, supabase]);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadBilling();
    });
  }, [hasInitialData, loadBilling]);

  const deepLinkTargetCharge = useMemo(() => {
    if (!deepLinkChargeId || loading) return null;
    const targetCharge = charges.find((charge) => charge.id === deepLinkChargeId);
    if (!targetCharge || !OPEN_CHARGE_STATUSES.has(targetCharge.status)) return null;
    return targetCharge;
  }, [deepLinkChargeId, loading, charges]);

  const deepLinkOpensUpcomingChargesPanel =
    deepLinkTargetCharge !== null && dismissedDeepLinkChargeId !== deepLinkChargeId;

  const upcomingChargesPanelOpen =
    manualUpcomingChargesPanelOpen || deepLinkOpensUpcomingChargesPanel;

  useEffect(() => {
    if (!deepLinkTargetCharge || !deepLinkChargeId) return;

    const scrollToCharge = () => {
      document
        .querySelector(`[data-charge-id="${deepLinkChargeId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    let rafId = 0;
    queueMicrotask(() => {
      setHighlightedChargeId(deepLinkChargeId);
      rafId = window.requestAnimationFrame(scrollToCharge);
    });
    const scrollTimeout = window.setTimeout(scrollToCharge, 300);
    const highlightTimeout = window.setTimeout(() => {
      setHighlightedChargeId(null);
    }, 3000);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(scrollTimeout);
      window.clearTimeout(highlightTimeout);
    };
  }, [deepLinkTargetCharge, deepLinkChargeId]);

  const childViews = familySummary?.children ?? [];
  const deepLinkChildKey = useMemo(() => {
    if (!deepLinkTargetCharge) return null;
    return (
      familySummary?.children.find(
        (child) => child.assignmentId === deepLinkTargetCharge.assignmentId,
      )?.childKey ?? null
    );
  }, [deepLinkTargetCharge, familySummary?.children]);
  const resolvedActiveChildKey = deepLinkChildKey ?? activeChildKey;
  const activeChild =
    childViews.find((child) => child.childKey === resolvedActiveChildKey) ??
    childViews[0] ??
    null;
  const hasMultipleChildren = childViews.length > 1;
  const studentColorMap = useMemo(
    () => buildStudentColorIndexMap(childViews.map((child) => child.childKey)),
    [childViews],
  );
  const selectedPaymentReceipt = useMemo(() => {
    if (!selectedPaymentId) return null;
    const relatedPayments = resolveRelatedTuitionPayments(
      payments,
      selectedPaymentId,
    );
    return buildTuitionPaymentReceiptDetail(relatedPayments);
  }, [payments, selectedPaymentId]);
  const hasPendingSchedule = familySummary?.hasPendingSchedule ?? false;
  const pendingScheduleCount = childViews.filter(
    (child) => child.status === "needs_schedule",
  ).length;

  const scheduleWarningMessage = hasPendingSchedule
    ? {
        title:
          pendingScheduleCount === 1 && childViews.length === 1
            ? "Action needed: choose a payment schedule"
            : `Action needed: choose payment schedules (${pendingScheduleCount} ${pendingScheduleCount === 1 ? "child" : "children"})`,
        body:
          pendingScheduleCount === 1 && childViews.length === 1
            ? "Select an installment plan below, then confirm to generate tuition charges."
            : `${pendingScheduleCount} ${pendingScheduleCount === 1 ? "child still needs" : "children still need"} a payment schedule. Select and confirm below for each student.`,
      }
    : null;

  const scrollToScheduleSelector = () => {
    document
      .getElementById("parent-tuition-plan-selector")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectChild = (childKey: string) => {
    setDetailModalChildKey(childKey);
  };

  const combinedChargesOnEarliestDueDate = useMemo(
    () => listOpenChargesOnEarliestDueDate(charges),
    [charges],
  );

  const nextChargeRecord = familySummary?.nextCharge
    ? [...charges]
        .filter(
          (charge) =>
            charge.dueDate === familySummary.nextCharge?.dueDate &&
            ["scheduled", "sent", "overdue"].includes(charge.status),
        )
        .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0))[0]
    : null;

  const chargesOnEarliestDueDate = countOpenChargesOnEarliestDueDate(charges);
  const familyPayNowLabel = resolveFamilyPayNowLabel({
    chargesOnEarliestDueDate,
  });

  const readinessMessage = (() => {
    if (!readiness) return null;
    if (charges.length > 0) return null;

    const childrenLabel =
      readiness.childrenNames.length > 0
        ? readiness.childrenNames.join(", ")
        : "your student";

    switch (readiness.state) {
      case "needs_assignment":
        return {
          title: "Tuition has not been assigned yet",
          body: `Billing for ${childrenLabel} has not been set up by your school yet. Charges will appear here once tuition is assigned.`,
          href: null,
          cta: null,
        };
      case "needs_payment_plan":
        if (hasPendingSchedule) return null;
        return {
          title: "Choose your payment schedule",
          body: "Select an installment plan below to generate your tuition charges.",
          href: null,
          cta: null,
        };
      case "no_charges":
        return {
          title: "Your schedule is being prepared",
          body: "Your school is finalizing tuition details. Check back soon or complete any remaining enrollment steps.",
          href: readiness.enrollmentChecklistHref,
          cta: readiness.enrollmentChecklistHref ? "Go to enrollment" : null,
        };
      default:
        return null;
    }
  })();

  const pendingPayContext = useMemo(() => {
    if (!pendingPayCharge) {
      return {
        payRemainingYearCents: 0,
        futureOpenCharges: [],
      };
    }
    return getAssignmentPaymentContext(
      charges,
      pendingPayCharge.assignmentId,
      pendingPayCharge.id,
    );
  }, [charges, pendingPayCharge]);

  const handlePay = (chargeId: string, options?: { extra?: boolean }) => {
    if (previewMode) return;
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge) return;
    if (chargeRemainingCents(charge) <= 0) return;

    setPayError(null);
    setPayAmountMode(options?.extra ? "custom" : "balance");
    setPayCustomDraft(formatCentsForInput(chargeRemainingCents(charge)));
    setPendingPayCharges(null);
    setPendingPayCharge(charge);
    setPaymentModalOpen(true);
  };

  const handlePayExtra = (chargeId: string) => {
    handlePay(chargeId, { extra: true });
  };

  const handlePayCombined = () => {
    if (previewMode) return;
    const combinedCharges = combinedChargesOnEarliestDueDate;
    if (combinedCharges.length < 2) return;

    setPayError(null);
    setPayAmountMode("balance");
    setPayCustomDraft("");
    setPendingPayCharge(null);
    setPendingPayCharges(combinedCharges);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    if (payCheckoutLoading) return;
    setPaymentModalOpen(false);
    setPendingPayCharge(null);
    setPendingPayCharges(null);
    setPayError(null);
    setPayingChargeId(null);
    setPayingCombined(false);
    setPayAmountMode("balance");
    setPayCustomDraft("");
  };

  const handleConfirmTuitionPayment = async (method: CheckoutPaymentMethod) => {
    if (previewMode) return;

    if (pendingPayCharges && pendingPayCharges.length > 0) {
      setPayCheckoutLoading(true);
      setPayError(null);
      setPayingCombined(true);

      try {
        const response = await fetch("/api/tuition/charges/combined-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethod: method,
            orgSlug: slug,
            chargeIds: pendingPayCharges.map((charge) => charge.id),
          }),
        });
        const payload = (await response.json()) as {
          checkoutUrl?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            typeof payload.error === "string"
              ? payload.error
              : "Failed to start checkout.",
          );
        }

        if (payload.checkoutUrl) {
          window.location.href = payload.checkoutUrl;
          return;
        }

        throw new Error("Failed to start checkout.");
      } catch (error) {
        setPayError(
          error instanceof Error ? error.message : "Failed to start checkout.",
        );
        setPayingCombined(false);
      } finally {
        setPayCheckoutLoading(false);
      }
      return;
    }

    if (!pendingPayCharge) return;

    const { amountCents, error: amountError } = pendingPayResolution;
    if (amountError) {
      setPayError(amountError);
      return;
    }

    setPayCheckoutLoading(true);
    setPayError(null);
    setPayingChargeId(pendingPayCharge.id);

    try {
      const body: {
        paymentMethod: CheckoutPaymentMethod;
        orgSlug: string;
        amountCents?: number;
      } = { paymentMethod: method, orgSlug: slug };

      const remainingCents = chargeRemainingCents(pendingPayCharge);
      if (amountCents > remainingCents) {
        body.amountCents = amountCents;
      }

      const response = await fetch(`/api/tuition/charges/${pendingPayCharge.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Failed to start checkout.",
        );
      }

      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }

      throw new Error("Failed to start checkout.");
    } catch (error) {
      setPayError(
        error instanceof Error ? error.message : "Failed to start checkout.",
      );
      setPayingChargeId(null);
    } finally {
      setPayCheckoutLoading(false);
    }
  };

  const handleAutopayToggleRequest = (enabled: boolean) => {
    if (previewMode || enabled === autopayEnabled) return;
    setPendingAutopayEnabled(enabled);
    setAutopayModalOpen(true);
  };

  const handleAutopayConfirm = async () => {
    if (previewMode) return;
    setAutopaySaving(true);
    try {
      const response = await fetch("/api/tuition/autopay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          familyId,
          enabled: pendingAutopayEnabled,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        autopayEnabled?: boolean;
        savedPaymentMethod?: SavedPaymentMethodSummary | null;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update autopay.");
      }
      setAutopayEnabledState(Boolean(payload.autopayEnabled));
      setSavedPaymentMethod(payload.savedPaymentMethod ?? null);
      setAutopayModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setAutopaySaving(false);
    }
  };

  const handleManagePaymentMethod = async () => {
    if (previewMode) return;
    setPaymentMethodLoading(true);
    try {
      const response = await fetch("/api/tuition/payment-method/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, familyId, orgSlug: slug }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }
      throw new Error(payload.error ?? "Could not start card setup.");
    } catch (error) {
      console.error(error);
      setPaymentMethodLoading(false);
    }
  };

  useEffect(() => {
    if (cardSaved !== "1") return;

    queueMicrotask(() => {
      void loadBilling().then(() => {
        router.replace(pathname, { scroll: false });
      });
    });
  }, [cardSaved, loadBilling, pathname, router]);

  const handleScheduleComplete = async () => {
    const currentKey = activeChildKey;
    const summary = await loadBilling();
    if (currentKey && summary) {
      setActiveChildKey(
        pickNextPendingChildKey(summary.children, currentKey) ?? currentKey,
      );
    }
  };

  const getOpenChargesForAssignment = (assignmentId: string | null) =>
    (assignmentId
      ? charges.filter((charge) => charge.assignmentId === assignmentId)
      : charges
    ).filter((charge) => OPEN_CHARGE_STATUSES.has(charge.status));

  const upcomingPanelAssignmentId =
    childViews.length > 0 && activeChild ? activeChild.assignmentId : null;
  const upcomingPanelCharges = getOpenChargesForAssignment(upcomingPanelAssignmentId);
  const upcomingPanelStudentName =
    childViews.length > 0 && activeChild ? activeChild.studentName : null;
  const upcomingPanelTotalRemainingCents =
    childViews.length > 0 && activeChild
      ? activeChild.totalRemainingCents
      : (familySummary?.totalRemainingCents ?? 0);

  const renderChildCharges = (assignmentId: string | null) => {
    const childCharges = getOpenChargesForAssignment(assignmentId);
    const summaryText = formatUpcomingChargesSummary(childCharges);

    return (
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Upcoming charges
        </h2>
        {childCharges.length > 0 ? (
          <button
            type="button"
            onClick={() => setManualUpcomingChargesPanelOpen(true)}
            aria-expanded={upcomingChargesPanelOpen}
            aria-controls="parent-billing-upcoming-charges-panel"
            className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm transition-shadow"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
            }}
            data-testid="parent-billing-upcoming-charges-trigger"
          >
            <div className="min-w-0">
              <p className="font-medium" style={{ color: C.textPrimary }}>
                View payment schedule
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                {summaryText}
              </p>
            </div>
            <ChevronRight
              className="h-4 w-4 shrink-0"
              style={{ color: C.textTertiary }}
              aria-hidden
            />
          </button>
        ) : (
          <p className="text-sm" style={{ color: C.textTertiary }}>
            No upcoming charges yet.
          </p>
        )}
      </div>
    );
  };

  const renderActiveChildPanel = () => {
    if (!activeChild) return null;

    if (activeChild.selectionItem) {
      return (
        <ParentTuitionPlanSelector
          C={C}
          context={activeChild.selectionItem.context}
          studentName={activeChild.studentName}
          onComplete={() => void handleScheduleComplete()}
          readOnly={previewMode}
        />
      );
    }

    return renderChildCharges(activeChild.assignmentId);
  };

  const detailModalChild =
    childViews.find((child) => child.childKey === detailModalChildKey) ?? null;

  if (loading) {
    return <ParentBillingPageFallback branding={branding} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
      <div className="text-center sm:text-left">
        <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
          Billing
        </h1>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          View your tuition schedule and pay online.
          {hasBillingSplit ? " Amounts shown are your portion of family tuition." : ""}
        </p>
      </div>

      {scheduleWarningMessage ? (
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{
            backgroundColor: C.warningBg,
            border: `1px solid ${C.warningBorder}`,
          }}
          data-testid="parent-billing-schedule-warning"
        >
          <div className="flex items-start gap-3">
            <CircleAlert
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: C.warning }}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {scheduleWarningMessage.title}
              </p>
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                {scheduleWarningMessage.body}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToScheduleSelector}
            className="inline-flex self-start px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: C.warning, color: "#fff" }}
          >
            Review options below
          </button>
        </div>
      ) : null}

      {showTaxCreditPaymentBanner && !dismissedTaxCreditBanner ? (
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{
            backgroundColor: C.accentLight,
            border: `1px solid ${C.border}`,
          }}
          data-testid="parent-billing-tax-credit-banner"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                Using Idaho Parent Choice Tax Credit?
              </p>
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                Apply a tax credit or lump sum on a child&apos;s tuition payment. Remaining
                monthly payments will be recalculated automatically.
              </p>
            </div>
            <button
              type="button"
              className="text-xs shrink-0"
              style={{ color: C.textSecondary }}
              onClick={() => setDismissedTaxCreditBanner(true)}
            >
              Dismiss
            </button>
          </div>
          {nextChargeRecord && !previewMode ? (
            <button
              type="button"
              onClick={() => handlePayExtra(nextChargeRecord.id)}
              className="inline-flex self-start px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              {EXTRA_PAY_BANNER_CTA}
            </button>
          ) : null}
        </div>
      ) : null}

      {readinessMessage ? (
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ backgroundColor: C.accentLight, border: `1px solid ${C.border}` }}
          data-testid="parent-billing-readiness"
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              {readinessMessage.title}
            </p>
            <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
              {readinessMessage.body}
            </p>
          </div>
          {readinessMessage.href && readinessMessage.cta ? (
            <Link
              href={readinessMessage.href}
              className="inline-flex self-start px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              {readinessMessage.cta}
            </Link>
          ) : null}
        </div>
      ) : null}

      {lateFeeNotice && !dismissedLateFeeNotice ? (
        <div
          className="rounded-xl p-4 flex items-start justify-between gap-3"
          style={{ backgroundColor: C.accentLight, border: `1px solid ${C.border}` }}
          data-testid="parent-billing-late-fee-banner"
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              A late fee was added to your balance
            </p>
            <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
              {formatCents(lateFeeNotice.totalCents)} was added
              {lateFeeNotice.labels.length === 1
                ? ` for ${lateFeeNotice.labels[0]}`
                : ` across ${lateFeeNotice.labels.length} late fees`}
              . Pay below to stay current.
            </p>
          </div>
          <button
            type="button"
            className="text-xs shrink-0"
            style={{ color: C.textSecondary }}
            onClick={() => setDismissedLateFeeNotice(true)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {recentAutopayFailure && !dismissedAutopayFailure ? (
        <div
          className="rounded-xl p-4 flex items-start justify-between gap-3"
          style={{ backgroundColor: C.accentLight, border: `1px solid ${C.border}` }}
          data-testid="parent-billing-autopay-failure-banner"
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Autopay could not process your last payment
            </p>
            <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
              {recentAutopayFailure.summary} Update your card or pay manually to stay current.
            </p>
          </div>
          <button
            type="button"
            className="text-xs shrink-0"
            style={{ color: C.textSecondary }}
            onClick={() => setDismissedAutopayFailure(true)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {familySummary ? (
        <ParentBillingSummaryCard
          C={C}
          summary={familySummary}
          autopayEnabled={autopayEnabled}
          payingChargeId={payingChargeId}
          payingCombined={payingCombined}
          onPay={handlePay}
          onPayExtra={handlePayExtra}
          onPayCombined={
            combinedChargesOnEarliestDueDate.length > 1
              ? handlePayCombined
              : undefined
          }
          onAutopayToggleRequest={handleAutopayToggleRequest}
          onSelectChild={handleSelectChild}
          nextChargeId={nextChargeRecord?.id ?? null}
          familyPayNowLabel={familyPayNowLabel}
          chargesOnEarliestDueDate={chargesOnEarliestDueDate}
          lastPaymentSummary={lastPaymentSummary}
          showStudentOnLastPayment={hasMultipleChildren}
          readOnly={previewMode}
        />
      ) : null}

      <ParentPaymentMethodCard
        C={C}
        savedPaymentMethod={savedPaymentMethod}
        loading={paymentMethodLoading}
        onManage={() => void handleManagePaymentMethod()}
        readOnly={previewMode}
      />

      <ParentAutopayConfirmModal
        C={C}
        open={autopayModalOpen}
        enabling={pendingAutopayEnabled}
        savedPaymentMethod={savedPaymentMethod}
        saving={autopaySaving}
        onConfirm={() => void handleAutopayConfirm()}
        onCancel={() => setAutopayModalOpen(false)}
      />

      <PaymentMethodSelectionModal
        C={C}
        open={
          paymentModalOpen &&
          (pendingPayCharge != null ||
            (pendingPayCharges != null && pendingPayCharges.length > 0))
        }
        onClose={handleClosePaymentModal}
        netAmountCents={pendingPayResolution.amountCents}
        label={
          pendingPayCharges && pendingPayCharges.length > 0
            ? `Combined tuition (${pendingPayCharges.length} students)`
            : singlePayModalLabel
        }
        lineItems={combinedPaymentLineItems}
        variant={
          pendingPayCharges && pendingPayCharges.length > 0 ? "combined" : "single"
        }
        savedPaymentMethod={savedPaymentMethod}
        loading={payCheckoutLoading}
        error={payError}
        confirmDisabled={Boolean(pendingPayResolution.error)}
        beforeSummary={
          pendingPayCharge && !pendingPayCharges?.length ? (
            <TuitionPayAmountField
              C={C}
              remainingCents={chargeRemainingCents(pendingPayCharge)}
              mode={payAmountMode}
              customDraft={payCustomDraft}
              payRemainingYearCents={pendingPayContext.payRemainingYearCents}
              showTaxCreditPreset={showTaxCreditPaymentBanner}
              futureOpenCharges={pendingPayContext.futureOpenCharges}
              onModeChange={setPayAmountMode}
              onCustomDraftChange={setPayCustomDraft}
            />
          ) : null
        }
        onConfirm={handleConfirmTuitionPayment}
      />

      <ParentBillingChildDetailModal
        C={C}
        open={detailModalChildKey != null}
        child={detailModalChild}
        charges={charges}
        adjustmentsByAssignment={adjustmentsByAssignment}
        payingChargeId={payingChargeId}
        autopayEnabled={autopayEnabled}
        readOnly={previewMode}
        onClose={() => setDetailModalChildKey(null)}
        onPay={(chargeId) => {
          setDetailModalChildKey(null);
          handlePay(chargeId);
        }}
        onReviewSchedule={() => {
          setDetailModalChildKey(null);
          if (detailModalChild) {
            setActiveChildKey(detailModalChild.childKey);
          }
          scrollToScheduleSelector();
        }}
      />

      <ParentBillingPaymentReceiptPanel
        C={C}
        open={paymentReceiptPanelOpen}
        receipt={selectedPaymentReceipt}
        studentColorMap={studentColorMap}
        onClose={() => {
          setPaymentReceiptPanelOpen(false);
          setSelectedPaymentId(null);
        }}
      />

      <ParentBillingUpcomingChargesPanel
        C={C}
        open={upcomingChargesPanelOpen}
        charges={upcomingPanelCharges}
        studentName={upcomingPanelStudentName}
        totalRemainingCents={upcomingPanelTotalRemainingCents}
        adjustmentsByAssignment={adjustmentsByAssignment}
        payingChargeId={payingChargeId}
        highlightedChargeId={highlightedChargeId}
        autopayEnabled={autopayEnabled}
        readOnly={previewMode}
        onClose={() => {
          setManualUpcomingChargesPanelOpen(false);
          if (deepLinkChargeId) {
            setDismissedDeepLinkChargeId(deepLinkChargeId);
          }
        }}
        onPay={handlePay}
      />

      {childViews.length > 0 ? (
        <div
          id="parent-billing-child-panel"
          className="flex flex-col gap-4"
          data-testid="parent-billing-child-panel"
        >
          {hasMultipleChildren && resolvedActiveChildKey ? (
            <ParentBillingChildTabs
              C={C}
              childViews={childViews}
              activeChildKey={resolvedActiveChildKey}
              onChange={setActiveChildKey}
            />
          ) : null}
          {renderActiveChildPanel()}
        </div>
      ) : (
        renderChildCharges(null)
      )}

      <div>
        <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Payment history
        </h2>
        {hasMultipleChildren ? (
          <p className="text-xs mt-1 mb-3" style={{ color: C.textTertiary }}>
            All students
          </p>
        ) : (
          <div className="mb-3" />
        )}
        {payments.length ? (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <ParentBillingPaymentHistoryRow
                key={payment.id}
                C={C}
                payment={payment}
                showStudentBadge={hasMultipleChildren}
                badgeColorIndex={
                  studentColorMap.get(payment.enrollmentId ?? "") ?? 0
                }
                onClick={() => {
                  setSelectedPaymentId(payment.id);
                  setPaymentReceiptPanelOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: C.textTertiary }}>
            No payments yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ParentBillingPage(props: ParentBillingPageProps) {
  return (
    <Suspense fallback={<ParentBillingPageFallback branding={props.branding} />}>
      <ParentBillingPageContent {...props} />
    </Suspense>
  );
}
