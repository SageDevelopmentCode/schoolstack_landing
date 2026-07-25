"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ParentBillingChildTabs from "@/components/school-parent/billing/ParentBillingChildTabs";
import ParentBillingSummaryCard from "@/components/school-parent/billing/ParentBillingSummaryCard";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { formatAdjustmentSummary, formatCents } from "@/lib/tuition/pricing";
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
import { createClient } from "@/utils/supabase/client";

type ParentBillingPageProps = {
  organizationId: string;
  familyId: string;
  branding: OrganizationBranding;
  slug: string;
};

export default function ParentBillingPage({
  organizationId,
  familyId,
  branding,
  slug,
}: ParentBillingPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [charges, setCharges] = useState<TuitionCharge[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [adjustments, setAdjustments] = useState<TuitionAdjustment[]>([]);
  const [autopayEnabled, setAutopayEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payingChargeId, setPayingChargeId] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<FamilyBillingReadiness | null>(null);
  const [familySummary, setFamilySummary] = useState<ParentBillingFamilySummary | null>(
    null,
  );
  const [activeChildKey, setActiveChildKey] = useState<string | null>(null);

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
    queueMicrotask(() => {
      void loadBilling();
    });
  }, [loadBilling]);

  const childViews = familySummary?.children ?? [];
  const activeChild =
    childViews.find((child) => child.childKey === activeChildKey) ?? childViews[0] ?? null;
  const hasMultipleChildren = childViews.length > 1;
  const hasPendingSelections = childViews.some((child) => child.selectionItem);

  const today = new Date().toISOString().slice(0, 10);
  const allChargesAreFuture =
    charges.length > 0 && charges.every((charge) => charge.dueDate > today);

  const nextChargeRecord = familySummary?.nextCharge
    ? charges.find(
        (charge) =>
          charge.label === familySummary.nextCharge?.label &&
          charge.dueDate === familySummary.nextCharge?.dueDate &&
          charge.amountCents === familySummary.nextCharge?.amountCents,
      )
    : null;

  const readinessMessage = (() => {
    if (hasPendingSelections) return null;
    if (!readiness) return null;
    if (charges.length > 0 && readiness.state === "ready" && allChargesAreFuture) {
      const firstCharge = readiness.firstChargeDue ?? familySummary?.nextCharge;
      if (!firstCharge) return null;
      const dueDate = "dueDate" in firstCharge ? firstCharge.dueDate : firstCharge.date;
      const amountCents = firstCharge.amountCents;
      return {
        title: "Your tuition schedule is ready",
        body: `Your first payment of ${formatCents(amountCents)} is due ${dueDate}.`,
        href: null as string | null,
        cta: null as string | null,
      };
    }
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
      <>
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
            Upcoming charges
          </h2>
          <div className="flex flex-col gap-2">
            {childCharges.length > 0 ? (
              childCharges.map((charge) => (
                <div
                  key={charge.id}
                  data-testid="parent-billing-charge-row"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p style={{ color: C.textPrimary }}>{charge.label}</p>
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      Due {charge.dueDate} · {charge.status}
                      {charge.baseAmountCents !== charge.amountCents ? " · adjusted" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {formatCents(charge.amountCents)}
                    </span>
                    {charge.status !== "paid" && charge.status !== "void" ? (
                      <button
                        type="button"
                        onClick={() => void handlePay(charge.id)}
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{ backgroundColor: C.accentLight, color: C.accent }}
                      >
                        Pay
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                No upcoming charges yet.
              </p>
            )}
          </div>
        </div>
      </>
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
        />
      );
    }

    return renderChildCharges(activeChild.assignmentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-sm" style={{ color: C.textSecondary }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading billing…
      </div>
    );
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
        />
      ) : null}

      {childViews.length > 0 ? (
        <div className="flex flex-col gap-4" data-testid="parent-billing-child-panel">
          {hasMultipleChildren && activeChildKey ? (
            <ParentBillingChildTabs
              C={C}
              children={childViews}
              activeChildKey={activeChildKey}
              onChange={setActiveChildKey}
            />
          ) : null}
          {renderActiveChildPanel()}
        </div>
      ) : (
        renderChildCharges(null)
      )}

      {adjustments.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
            Applied adjustments
          </h2>
          <div className="flex flex-col gap-2">
            {adjustments.map((adjustment) => (
              <div
                key={adjustment.id}
                className="px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
              >
                <p style={{ color: C.textPrimary }}>
                  {formatAdjustmentSummary(
                    adjustment.adjustmentType,
                    adjustment.valuePercent,
                    adjustment.valueCents,
                    adjustment.reason,
                  )}
                </p>
                <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                  {adjustment.scope === "annual_total" ? "Annual total" : "Per installment"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
