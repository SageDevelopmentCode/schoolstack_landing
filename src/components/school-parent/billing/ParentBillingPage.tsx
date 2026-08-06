"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Loader2 } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingChildTabs from "@/components/school-parent/billing/ParentBillingChildTabs";
import ParentBillingSummaryCard from "@/components/school-parent/billing/ParentBillingSummaryCard";
import ParentAutopayConfirmModal from "@/components/school-parent/billing/ParentAutopayConfirmModal";
import ParentPaymentMethodCard from "@/components/school-parent/billing/ParentPaymentMethodCard";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import TuitionPayAmountField, {
  resolveTuitionPayAmountCents,
  type TuitionPayAmountMode,
} from "@/components/school-parent/billing/TuitionPayAmountField";
import PaymentMethodSelectionModal from "@/components/admissions/PaymentMethodSelectionModal";
import { listChargesForFamily, listChargesForFamilyGuardian } from "@/lib/tuition/charges";
import { chargeRemainingCents, listBillingSplits } from "@/lib/tuition/billing-splits";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listParentTuitionPaymentHistory } from "@/lib/tuition/payments";
import { buildStudentColorIndexMap } from "@/lib/tuition/student-badge-colors";
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
  fetchParentBillingFamilySummary,
  pickInitialChildKey,
  pickNextPendingChildKey,
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
  const [payCheckoutLoading, setPayCheckoutLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
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

  const pendingPayResolution = useMemo(() => {
    if (!pendingPayCharge) {
      return { amountCents: 0, error: null as string | null };
    }

    return resolveTuitionPayAmountCents({
      mode: payAmountMode,
      remainingCents: chargeRemainingCents(pendingPayCharge),
      customDraft: payCustomDraft,
    });
  }, [pendingPayCharge, payAmountMode, payCustomDraft]);

  const loadBilling = useCallback(async (): Promise<ParentBillingFamilySummary | null> => {
    setLoading(true);
    try {
      const billingSplits = await listBillingSplits(supabase, familyId);
      const splitActive = billingSplits.length > 0;
      const [allChargeRows, chargeRows, paymentRows, adjustmentRows, readinessState] =
        await Promise.all([
          listChargesForFamily(supabase, familyId),
          listChargesForFamilyGuardian(supabase, familyId, guardianId, {
            hasBillingSplit: splitActive,
          }),
          listParentTuitionPaymentHistory(supabase, familyId),
          listAdjustmentsForFamily(supabase, familyId),
          fetchFamilyBillingReadiness(supabase, {
            organizationId,
            familyId,
            slug,
          }),
        ]);

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

  useEffect(() => {
    if (!deepLinkChargeId || loading) return;

    const targetCharge = charges.find((charge) => charge.id === deepLinkChargeId);
    if (!targetCharge) return;

    document
      .querySelector(`[data-charge-id="${deepLinkChargeId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    queueMicrotask(() => {
      setHighlightedChargeId(deepLinkChargeId);
    });
    const timeout = window.setTimeout(() => {
      setHighlightedChargeId(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [charges, deepLinkChargeId, loading]);

  const childViews = familySummary?.children ?? [];
  const deepLinkChildKey = useMemo(() => {
    if (!deepLinkChargeId || loading) return null;
    const targetCharge = charges.find((charge) => charge.id === deepLinkChargeId);
    if (!targetCharge) return null;
    return (
      familySummary?.children.find(
        (child) => child.assignmentId === targetCharge.assignmentId,
      )?.childKey ?? null
    );
  }, [deepLinkChargeId, charges, familySummary?.children, loading]);
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

  const nextChargeRecord = familySummary?.nextCharge
    ? [...charges]
        .filter(
          (charge) =>
            charge.dueDate === familySummary.nextCharge?.dueDate &&
            ["scheduled", "sent", "overdue"].includes(charge.status),
        )
        .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0))[0]
    : null;

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

  const handlePay = (chargeId: string) => {
    if (previewMode) return;
    const charge = charges.find((row) => row.id === chargeId);
    if (!charge) return;
    if (chargeRemainingCents(charge) <= 0) return;

    setPayError(null);
    setPayAmountMode("balance");
    setPayCustomDraft(formatCentsForInput(chargeRemainingCents(charge)));
    setPendingPayCharge(charge);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    if (payCheckoutLoading) return;
    setPaymentModalOpen(false);
    setPendingPayCharge(null);
    setPayError(null);
    setPayingChargeId(null);
    setPayAmountMode("balance");
    setPayCustomDraft("");
  };

  const handleConfirmTuitionPayment = async (method: CheckoutPaymentMethod) => {
    if (!pendingPayCharge || previewMode) return;

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

  const renderChildCharges = (assignmentId: string | null) => {
    const childCharges = (assignmentId
      ? charges.filter((charge) => charge.assignmentId === assignmentId)
      : charges
    ).filter((charge) => OPEN_CHARGE_STATUSES.has(charge.status));

    return (
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Upcoming charges
        </h2>
        <div className="flex flex-col gap-2">
          {childCharges.length > 0 ? (
            childCharges.map((charge) => (
              <ParentBillingChargeRow
                key={charge.id}
                C={C}
                charge={charge}
                adjustmentsForAssignment={
                  adjustmentsByAssignment.get(charge.assignmentId) ?? []
                }
                payingChargeId={payingChargeId}
                highlighted={highlightedChargeId === charge.id}
                autopayEnabled={autopayEnabled}
                onPay={handlePay}
                readOnly={previewMode}
              />
            ))
          ) : (
            <p className="text-sm" style={{ color: C.textTertiary }}>
              No upcoming charges yet.
            </p>
          )}
        </div>
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
          onPay={handlePay}
          onAutopayToggleRequest={handleAutopayToggleRequest}
          nextChargeId={nextChargeRecord?.id ?? null}
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
        open={paymentModalOpen && pendingPayCharge != null}
        onClose={handleClosePaymentModal}
        netAmountCents={pendingPayResolution.amountCents}
        label={pendingPayCharge?.label ?? "Tuition payment"}
        savedPaymentMethod={savedPaymentMethod}
        loading={payCheckoutLoading}
        error={payError}
        confirmDisabled={Boolean(pendingPayResolution.error)}
        beforeSummary={
          pendingPayCharge ? (
            <TuitionPayAmountField
              C={C}
              remainingCents={chargeRemainingCents(pendingPayCharge)}
              mode={payAmountMode}
              customDraft={payCustomDraft}
              onModeChange={setPayAmountMode}
              onCustomDraftChange={setPayCustomDraft}
            />
          ) : null
        }
        onConfirm={handleConfirmTuitionPayment}
      />

      {childViews.length > 0 ? (
        <div className="flex flex-col gap-4" data-testid="parent-billing-child-panel">
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
