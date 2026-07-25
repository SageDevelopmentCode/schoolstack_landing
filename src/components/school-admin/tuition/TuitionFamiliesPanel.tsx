"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { listFamilyBillingSummaries } from "@/lib/tuition/charges";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { formatCents } from "@/lib/tuition/pricing";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { FamilyBillingSummary } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionFamiliesPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
  onAdjust: (familyId: string, assignmentId: string) => void;
  onEditAssignment: (assignmentId: string) => void;
  onRefresh: () => void;
};

export default function TuitionFamiliesPanel({
  organizationId,
  branding,
  onAdjust,
  onEditAssignment,
}: TuitionFamiliesPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [families, setFamilies] = useState<FamilyBillingSummary[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listFamilyBillingSummaries(supabase, organizationId);
      setFamilies(rows);
      setSelectedFamilyId((prev) => {
        if (prev && rows.some((r) => r.familyId === prev)) return prev;
        return rows[0]?.familyId ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadFamilies();
    });
  }, [loadFamilies]);

  const selectedFamily =
    families.find((f) => f.familyId === selectedFamilyId) ?? null;

  const handleManualPayment = async (chargeId: string) => {
    setActionLoading(chargeId);
    try {
      await fetch(`/api/tuition/charges/${chargeId}/manual-payment`, {
        method: "POST",
      });
      await loadFamilies();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInvoice = async (chargeId: string) => {
    setActionLoading(chargeId);
    try {
      await fetch(`/api/tuition/charges/${chargeId}/send`, {
        method: "POST",
      });
      await loadFamilies();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await fetch(`/api/tuition/payments/${paymentId}/refund`, {
        method: "POST",
      });
      await loadFamilies();
    } finally {
      setActionLoading(null);
    }
  };

  const [familyCharges, setFamilyCharges] = useState<
    Awaited<ReturnType<typeof listChargesForFamily>>
  >([]);
  const [familyPayments, setFamilyPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!selectedFamilyId) {
      setFamilyCharges([]);
      setFamilyPayments([]);
      return;
    }
    void Promise.all([
      listChargesForFamily(supabase, selectedFamilyId),
      listTuitionPaymentsForFamily(supabase, selectedFamilyId),
    ]).then(([charges, payments]) => {
      setFamilyCharges(charges);
      setFamilyPayments(payments);
    });
  }, [selectedFamilyId, supabase, families]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading families…
      </div>
    );
  }

  if (!families.length) {
    return (
      <div
        className="rounded-xl p-10 text-center flex flex-col items-center gap-3"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          No family billing yet
        </p>
        <p className="text-sm max-w-md" style={{ color: C.textSecondary }}>
          When students enroll and are assigned a rate plan, families will appear here
          with their tuition schedule and balance.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
      >
        {families.map((family) => (
          <button
            key={family.familyId}
            type="button"
            onClick={() => setSelectedFamilyId(family.familyId)}
            className="w-full text-left px-4 py-3 border-b"
            style={{
              borderColor: C.border,
              backgroundColor:
                selectedFamilyId === family.familyId ? C.accentLight : "transparent",
            }}
          >
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {family.familyName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
              Balance {formatCents(family.balanceDueCents)} · {family.status}
            </p>
          </button>
        ))}
        {!families.length ? (
          <p className="p-4 text-sm" style={{ color: C.textTertiary }}>
            No families to display.
          </p>
        ) : null}
      </div>

      {selectedFamily ? (
        <div
          className="rounded-lg p-5 flex flex-col gap-4"
          style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {selectedFamily.familyName}
              </h2>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                {selectedFamily.children.join(", ") || "No students"}
              </p>
              <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                {selectedFamily.programs.join(", ")}
              </p>
            </div>
            {selectedFamily.assignmentIds[0] ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEditAssignment(selectedFamily.assignmentIds[0]!)}
                  className="text-sm font-medium px-3 py-1.5 rounded-md"
                  style={{ backgroundColor: C.bg, color: C.textPrimary, border: `1px solid ${C.border}` }}
                >
                  Edit assignment
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAdjust(selectedFamily.familyId, selectedFamily.assignmentIds[0]!)
                  }
                  className="text-sm font-medium px-3 py-1.5 rounded-md"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  Adjust tuition
                </button>
              </div>
            ) : null}
          </div>

          {selectedFamily.assignments.length > 0 ? (
            <div
              className="rounded-lg p-4 flex flex-col gap-3"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Enrollment assignments
              </p>
              <ul className="flex flex-col gap-3">
                {selectedFamily.assignments.map((assignment) => (
                  <li
                    key={assignment.assignmentId}
                    className="flex flex-col gap-1 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: C.textPrimary }}>
                        {assignment.studentName ?? "Student"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditAssignment(assignment.assignmentId)}
                        className="text-xs font-medium"
                        style={{ color: C.accent }}
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      {assignment.ratePlanName}
                      {assignment.tierLabel ? ` · ${assignment.tierLabel}` : ""}
                      {" · "}
                      {assignment.paymentPlanLabel}
                      {assignment.pendingPaymentPlanSelection
                        ? " · Awaiting family schedule choice"
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs uppercase" style={{ color: C.textTertiary }}>
                Balance due
              </p>
              <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                {formatCents(selectedFamily.balanceDueCents)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase" style={{ color: C.textTertiary }}>
                Paid YTD
              </p>
              <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                {formatCents(selectedFamily.paidYtdCents)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase" style={{ color: C.textTertiary }}>
                Next due
              </p>
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                {selectedFamily.nextDue
                  ? `${selectedFamily.nextDue.label} · ${formatCents(selectedFamily.nextDue.amountCents)}`
                  : "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
              Schedule
            </p>
            <div className="flex flex-col gap-2">
              {familyCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p style={{ color: C.textPrimary }}>{charge.label}</p>
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      Due {charge.dueDate} · {charge.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {formatCents(charge.amountCents)}
                    </span>
                    {charge.status !== "paid" && charge.status !== "void" ? (
                      <>
                        {charge.status === "scheduled" ? (
                          <button
                            type="button"
                            disabled={actionLoading === charge.id}
                            onClick={() => void handleSendInvoice(charge.id)}
                            className="text-xs font-medium px-2 py-1 rounded"
                            style={{ backgroundColor: C.bg, color: C.textPrimary, border: `1px solid ${C.border}` }}
                          >
                            Send invoice
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={actionLoading === charge.id}
                          onClick={() => void handleManualPayment(charge.id)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          Mark paid
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {familyPayments.some((payment) => payment.status === "succeeded") ? (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
                Recent payments
              </p>
              <div className="flex flex-col gap-2">
                {familyPayments
                  .filter((payment) => payment.status === "succeeded")
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm"
                      style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                    >
                      <div>
                        <p style={{ color: C.textPrimary }}>
                          {payment.label ?? "Tuition payment"}
                        </p>
                        <p className="text-xs" style={{ color: C.textTertiary }}>
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString()
                            : payment.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: C.textPrimary }}>
                          {formatCents(payment.amountCents)}
                        </span>
                        <button
                          type="button"
                          disabled={actionLoading === payment.id}
                          onClick={() => void handleRefund(payment.id)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{ backgroundColor: C.bg, color: C.textPrimary, border: `1px solid ${C.border}` }}
                        >
                          Refund
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
