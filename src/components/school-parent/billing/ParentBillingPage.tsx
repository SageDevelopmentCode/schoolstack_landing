"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { formatAdjustmentSummary, formatCents } from "@/lib/tuition/pricing";
import { setAutopayEnabled } from "@/lib/tuition/autopay";
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

  const loadBilling = useCallback(async () => {
    setLoading(true);
    try {
      const [chargeRows, paymentRows, adjustmentRows] = await Promise.all([
        listChargesForFamily(supabase, familyId),
        listTuitionPaymentsForFamily(supabase, familyId),
        listAdjustmentsForFamily(supabase, familyId),
      ]);
      setCharges(chargeRows);
      setPayments(paymentRows);
      setAdjustments(adjustmentRows);

      const { data: account } = await supabase
        .from("tuition_billing_accounts")
        .select("autopay_enabled")
        .eq("organization_id", organizationId)
        .eq("family_id", familyId)
        .maybeSingle();

      setAutopayEnabledState(Boolean(account?.autopay_enabled));
    } finally {
      setLoading(false);
    }
  }, [familyId, organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadBilling();
    });
  }, [loadBilling]);

  const openCharges = charges.filter(
    (c) => c.status === "scheduled" || c.status === "sent" || c.status === "overdue",
  );
  const balanceDueCents = openCharges.reduce((sum, c) => sum + c.amountCents, 0);
  const nextCharge = openCharges.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm" style={{ color: C.textSecondary }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading billing…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
          Billing
        </h1>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          View your tuition schedule and pay online.
        </p>
      </div>

      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Balance due
            </p>
            <p className="text-2xl font-semibold mt-1" style={{ color: C.textPrimary }}>
              {formatCents(balanceDueCents)}
            </p>
            {nextCharge ? (
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                Next: {nextCharge.label} due {nextCharge.dueDate}
              </p>
            ) : null}
          </div>
          {nextCharge ? (
            <button
              type="button"
              disabled={payingChargeId === nextCharge.id}
              onClick={() => void handlePay(nextCharge.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: C.accent, color: "#fff" }}
            >
              {payingChargeId === nextCharge.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Pay now
            </button>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
          <input
            type="checkbox"
            checked={autopayEnabled}
            onChange={() => void handleAutopayToggle()}
          />
          Enable autopay for due charges
        </label>
      </div>

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
          Upcoming charges
        </h2>
        <div className="flex flex-col gap-2">
          {charges.map((charge) => (
            <div
              key={charge.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            >
              <div>
                <p style={{ color: C.textPrimary }}>{charge.label}</p>
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  Due {charge.dueDate} · {charge.status}
                  {charge.baseAmountCents !== charge.amountCents
                    ? " · adjusted"
                    : ""}
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
          ))}
        </div>
      </div>

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
