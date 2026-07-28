"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingChildTabs from "@/components/school-parent/billing/ParentBillingChildTabs";
import ParentBillingSummaryCard from "@/components/school-parent/billing/ParentBillingSummaryCard";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { formatCents } from "@/lib/tuition/pricing";
import { setAutopayEnabled } from "@/lib/tuition/autopay";
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
import type { PaymentRecord } from "@/lib/stripe/application-payments";
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
  const searchParams = useSearchParams();
  const deepLinkChargeId = searchParams.get("charge");
  const hasInitialData = initialData !== undefined;

  const [charges, setCharges] = useState<TuitionCharge[]>(initialData?.charges ?? []);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialData?.payments ?? []);
  const [adjustments, setAdjustments] = useState<TuitionAdjustment[]>(
    initialData?.adjustments ?? [],
  );
  const [autopayEnabled, setAutopayEnabledState] = useState(
    initialData?.autopayEnabled ?? false,
  );
  const [loading, setLoading] = useState(!hasInitialData);
  const [payingChargeId, setPayingChargeId] = useState<string | null>(null);
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

  const loadBilling = useCallback(async (): Promise<ParentBillingFamilySummary | null> => {
    setLoading(true);
    try {
      const [chargeRows, paymentRows, adjustmentRows, readinessState] = await Promise.all([
        listChargesForFamily(supabase, familyId),
        listTuitionPaymentsForFamily(supabase, familyId),
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
        .select("autopay_enabled")
        .eq("organization_id", organizationId)
        .eq("family_id", familyId)
        .maybeSingle();

      setAutopayEnabledState(Boolean(account?.autopay_enabled));
      return summary;
    } finally {
      setLoading(false);
    }
  }, [familyId, organizationId, slug, supabase]);

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
  const hasPendingSelections = childViews.some((child) => child.selectionItem);

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
    if (hasPendingSelections) return null;
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

  const handlePay = async (chargeId: string) => {
    if (previewMode) return;
    setPayingChargeId(chargeId);
    try {
      const response = await fetch(`/api/tuition/charges/${chargeId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "card", orgSlug: slug }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string };
      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
      }
    } finally {
      setPayingChargeId(null);
    }
  };

  const handleAutopayToggle = async () => {
    if (previewMode) return;
    const next = !autopayEnabled;
    await setAutopayEnabled(supabase, organizationId, familyId, next);
    setAutopayEnabledState(next);
  };

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
    const childCharges = assignmentId
      ? charges.filter((charge) => charge.assignmentId === assignmentId)
      : charges;

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
                onPay={(chargeId) => void handlePay(chargeId)}
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
        </p>
      </div>

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

      {familySummary ? (
        <ParentBillingSummaryCard
          C={C}
          summary={familySummary}
          autopayEnabled={autopayEnabled}
          payingChargeId={payingChargeId}
          onPay={(chargeId) => void handlePay(chargeId)}
          onAutopayToggle={() => void handleAutopayToggle()}
          nextChargeId={nextChargeRecord?.id ?? null}
          readOnly={previewMode}
        />
      ) : null}

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
        <h2 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Payment history
        </h2>
        {payments.length ? (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
              >
                <div>
                  <p style={{ color: C.textPrimary }}>{payment.label ?? "Tuition payment"}</p>
                  <p className="text-xs" style={{ color: C.textTertiary }}>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString()
                      : payment.status}
                  </p>
                </div>
                <span className="font-medium" style={{ color: C.textPrimary }}>
                  {formatCents(payment.amountCents)}
                </span>
              </div>
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
