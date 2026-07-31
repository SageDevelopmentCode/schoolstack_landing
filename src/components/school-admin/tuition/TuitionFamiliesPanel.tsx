"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { listFamilyBillingSummaries } from "@/lib/tuition/charges";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { formatCents } from "@/lib/tuition/pricing";
import { buildAdminThemeTokens, type AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { FamilyAssignmentSummary, FamilyBillingSummary } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";
import TuitionBillingSplitModal from "@/components/school-admin/tuition/TuitionBillingSplitModal";

type TuitionFamiliesPanelProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  onAdjust: (familyId: string, assignmentId: string) => void;
  onEditAssignment: (assignmentId: string) => void;
  onRefresh: () => void;
};

function AssignmentMetaBadges({
  assignment,
  C,
}: {
  assignment: FamilyAssignmentSummary;
  C: AdminThemeTokens;
}) {
  const neutralStyle = { backgroundColor: C.accentLight, color: C.accentDark };

  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={neutralStyle}
      >
        {assignment.ratePlanName}
      </span>
      {assignment.tierLabel ? (
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={neutralStyle}
        >
          {assignment.tierLabel}
        </span>
      ) : null}
      {!assignment.pendingPaymentPlanSelection ? (
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={neutralStyle}
        >
          {assignment.paymentPlanLabel}
        </span>
      ) : null}
      {assignment.pendingPaymentPlanSelection ? (
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: C.accent, color: "#fff" }}
        >
          Awaiting schedule choice
        </span>
      ) : null}
    </div>
  );
}

export default function TuitionFamiliesPanel({
  organizationId,
  slug,
  branding,
  onAdjust,
  onEditAssignment,
  onRefresh,
}: TuitionFamiliesPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [families, setFamilies] = useState<FamilyBillingSummary[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [invoiceNotice, setInvoiceNotice] = useState<string | null>(null);
  const [splitModalOpen, setSplitModalOpen] = useState(false);

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
      const response = await fetch(`/api/tuition/charges/${chargeId}/manual-payment`, {
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to record manual payment.");
      }
      adminToast.success("Manual payment recorded");
      await loadFamilies();
    } catch (err) {
      const message = formatActionError(err, "Failed to record manual payment.");
      setPanelError(message);
      adminToast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInvoice = async (chargeId: string) => {
    setActionLoading(chargeId);
    setInvoiceNotice(null);
    try {
      const response = await fetch(`/api/tuition/charges/${chargeId}/send`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        emailed?: boolean;
      };
      if (!response.ok) {
        const message = payload.error ?? "Failed to send invoice.";
        setPanelError(message);
        adminToast.error(message);
        return;
      }
      const notice = payload.emailed
        ? "Invoice sent by email."
        : "Charge marked sent. Email was not sent (mail not configured or family has no email).";
      setInvoiceNotice(notice);
      adminToast.success(payload.emailed ? "Invoice sent" : "Charge marked sent");
      await loadFamilies();
    } catch (err) {
      const message = formatActionError(err, "Failed to send invoice.");
      setPanelError(message);
      adminToast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const response = await fetch(`/api/tuition/payments/${paymentId}/refund`, {
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to process refund.");
      }
      adminToast.success("Refund processed");
      await loadFamilies();
    } catch (err) {
      const message = formatActionError(err, "Failed to process refund.");
      setPanelError(message);
      adminToast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (
      !window.confirm(
        "Unassign tuition for this student? Future unpaid charges will be removed.",
      )
    ) {
      return;
    }

    setActionLoading(assignmentId);
    setPanelError(null);
    try {
      const response = await fetch(`/api/tuition/assignments/${assignmentId}/unassign`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Failed to unassign tuition.";
        setPanelError(message);
        adminToast.error(message);
        return;
      }
      adminToast.success("Tuition unassigned");
      await loadFamilies();
      onRefresh();
    } catch (error) {
      const message = formatActionError(error, "Failed to unassign tuition.");
      setPanelError(message);
      adminToast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncAssignments = async () => {
    setActionLoading("sync");
    setPanelError(null);
    try {
      const response = await fetch("/api/tuition/sync-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = payload.error ?? "Failed to sync tuition assignments.";
        setPanelError(message);
        adminToast.error(message);
        return;
      }
      adminToast.success("Tuition assignments synced");
      await loadFamilies();
      onRefresh();
    } catch (error) {
      const message = formatActionError(error, "Failed to sync tuition assignments.");
      setPanelError(message);
      adminToast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const familyStatusLabel = (family: FamilyBillingSummary) => {
    if (family.readiness === "ready") {
      return `Balance ${formatCents(family.balanceDueCents)} · ${family.status}`;
    }
    return "Setup needed";
  };

  const [familyCharges, setFamilyCharges] = useState<
    Awaited<ReturnType<typeof listChargesForFamily>>
  >([]);
  const [familyPayments, setFamilyPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!selectedFamilyId) return;
    void Promise.all([
      listChargesForFamily(supabase, selectedFamilyId),
      listTuitionPaymentsForFamily(supabase, selectedFamilyId),
    ]).then(([charges, payments]) => {
      setFamilyCharges(charges);
      setFamilyPayments(payments);
    });
  }, [selectedFamilyId, supabase, families]);

  const displayedFamilyCharges = selectedFamilyId ? familyCharges : [];
  const displayedFamilyPayments = selectedFamilyId ? familyPayments : [];

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
              {familyStatusLabel(family)}
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
          {invoiceNotice ? (
            <p
              className="text-sm rounded-md px-3 py-2"
              style={{ backgroundColor: C.bg, color: C.textSecondary, border: `1px solid ${C.border}` }}
              data-testid="tuition-invoice-notice"
            >
              {invoiceNotice}
            </p>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {selectedFamily.familyName}
              </h2>
              {selectedFamily.billingSplitSummary ? (
                <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                  Split billing: {selectedFamily.billingSplitSummary}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSplitModalOpen(true)}
              className="text-xs font-medium px-2 py-1 rounded shrink-0"
              style={{
                backgroundColor: C.bg,
                color: C.textPrimary,
                border: `1px solid ${C.border}`,
              }}
              data-testid="tuition-billing-split-button"
            >
              Billing split
            </button>
          </div>

          {panelError ? (
            <p className="text-sm" style={{ color: C.error }}>
              {panelError}
            </p>
          ) : null}

          {selectedFamily.readiness === "needs_assignment" ? (
            <div
              className="rounded-lg p-4 flex flex-col gap-3"
              style={{
                backgroundColor: C.accentLight,
                border: `1px solid ${C.border}`,
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  Tuition has not been assigned yet
                </p>
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  Tuition is assigned automatically at enrollment. Sync assignments if this
                  student enrolled before your rate plan was ready.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-2">
                  {selectedFamily.unassignedEnrollments.map((enrollment) => (
                    <li
                      key={enrollment.enrollmentId}
                      className="text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {enrollment.studentName} · {enrollment.programName}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={actionLoading === "sync"}
                  onClick={() => void handleSyncAssignments()}
                  className="self-start text-xs font-medium px-2 py-1 rounded"
                  style={{ backgroundColor: C.accent, color: "#fff" }}
                >
                  Sync assignments
                </button>
              </div>
            </div>
          ) : null}

          {selectedFamily.assignments.length > 0 ? (
            <div
              className="rounded-lg p-4 flex flex-col gap-3"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Enrollment assignments
              </p>
              {selectedFamily.readiness === "no_charges" ? (
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  Charges appear after tuition is assigned and the payment schedule is
                  confirmed.
                </p>
              ) : null}
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditAssignment(assignment.assignmentId)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: C.bg,
                            color: C.textPrimary,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAdjust(selectedFamily.familyId, assignment.assignmentId)
                          }
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          Adjust
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === assignment.assignmentId}
                          onClick={() => void handleUnassign(assignment.assignmentId)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: C.bg,
                            color: C.textSecondary,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          Unassign
                        </button>
                      </div>
                    </div>
                    <AssignmentMetaBadges assignment={assignment} C={C} />
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
              {displayedFamilyCharges.length > 0 ? (
                displayedFamilyCharges.map((charge) => (
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
                            style={{ backgroundColor: C.accent, color: "#fff" }}
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
                ))
              ) : (
                <p className="text-sm px-3 py-2 rounded-md" style={{ color: C.textSecondary, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  No charges yet. Assign a rate plan and choose a payment schedule to generate the billing schedule.
                </p>
              )}
            </div>
          </div>

          {displayedFamilyPayments.some((payment) => payment.status === "succeeded") ? (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
                Recent payments
              </p>
              <div className="flex flex-col gap-2">
                {displayedFamilyPayments
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

      {splitModalOpen && selectedFamily ? (
        <TuitionBillingSplitModal
          familyId={selectedFamily.familyId}
          familyName={selectedFamily.familyName}
          branding={branding}
          onClose={() => setSplitModalOpen(false)}
          onSaved={() => void loadFamilies()}
        />
      ) : null}
    </div>
  );
}
