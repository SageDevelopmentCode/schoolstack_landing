"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { listFamilyBillingSummaries } from "@/lib/tuition/charges";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { childFirstNameFromFullName } from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import {
  buildStudentColorIndexMap,
  getStudentBadgeColors,
  type StudentBadgeColors,
} from "@/lib/tuition/student-badge-colors";
import { buildAdminThemeTokens, type AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { FamilyAssignmentSummary, FamilyBillingSummary } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";
import TuitionBillingSplitModal from "@/components/school-admin/tuition/TuitionBillingSplitModal";
import TuitionManualPaymentModal from "@/components/school-admin/tuition/TuitionManualPaymentModal";
import TuitionFamilyTabBar from "@/components/school-admin/tuition/TuitionFamilyTabBar";
import {
  DEFAULT_TUITION_FAMILY_TAB,
  type TuitionFamilyTabId,
} from "@/components/school-admin/tuition/tuition-family-tabs";

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function TuitionStudentBadge({
  firstName,
  badgeColors,
}: {
  firstName: string;
  badgeColors: StudentBadgeColors;
}) {
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: badgeColors.backgroundColor,
        color: badgeColors.color,
      }}
    >
      For {firstName}
    </span>
  );
}

type TuitionFamiliesPanelProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  reloadToken?: number;
  onAdjust: (familyId: string, assignmentId: string, studentName: string | null) => void;
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
      {assignment.activeAdjustmentCount > 0 && assignment.adjustmentSummaryLabel ? (
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: C.successBg, color: C.success }}
          title={assignment.adjustmentSummaryFull ?? assignment.adjustmentSummaryLabel}
        >
          {assignment.adjustmentSummaryLabel}
        </span>
      ) : null}
    </div>
  );
}

export default function TuitionFamiliesPanel({
  organizationId,
  slug,
  branding,
  reloadToken = 0,
  onAdjust,
  onEditAssignment,
  onRefresh,
}: TuitionFamiliesPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;
  const [families, setFamilies] = useState<FamilyBillingSummary[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [invoiceNotice, setInvoiceNotice] = useState<string | null>(null);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [manualPaymentCharge, setManualPaymentCharge] = useState<{
    id: string;
    label: string;
    amountCents: number;
    paidCents: number;
  } | null>(null);
  const [activeFamilyTab, setActiveFamilyTab] = useState<TuitionFamilyTabId>(
    DEFAULT_TUITION_FAMILY_TAB,
  );
  const selectedFamilyIdRef = useRef<string | null>(null);

  const selectFamily = useCallback((familyId: string) => {
    selectedFamilyIdRef.current = familyId;
    setSelectedFamilyId(familyId);
    setActiveFamilyTab(DEFAULT_TUITION_FAMILY_TAB);
  }, []);

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listFamilyBillingSummaries(supabase, organizationId);
      setFamilies(rows);
      const prev = selectedFamilyIdRef.current;
      const next =
        prev && rows.some((r) => r.familyId === prev) ? prev : rows[0]?.familyId ?? null;
      if (next !== prev) {
        setActiveFamilyTab(DEFAULT_TUITION_FAMILY_TAB);
      }
      selectedFamilyIdRef.current = next;
      setSelectedFamilyId(next);
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadFamilies();
    });
  }, [loadFamilies, reloadToken]);

  const selectedFamily =
    families.find((f) => f.familyId === selectedFamilyId) ?? null;

  const handleManualPayment = async (amountCents: number) => {
    if (!manualPaymentCharge) return;
    const chargeId = manualPaymentCharge.id;
    setActionLoading(chargeId);
    try {
      const response = await fetch(`/api/tuition/charges/${chargeId}/manual-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to record manual payment.");
      }
      adminToast.success("Manual payment recorded");
      setManualPaymentCharge(null);
      await loadFamilies();
      if (selectedFamilyId) {
        const [charges, payments] = await Promise.all([
          listChargesForFamily(supabase, selectedFamilyId),
          listTuitionPaymentsForFamily(supabase, selectedFamilyId),
        ]);
        setFamilyCharges(charges);
        setFamilyPayments(payments);
      }
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
    const autopayLabel =
      family.autopayStatus === "on"
        ? "Autopay on"
        : family.autopayStatus === "partial"
          ? "Autopay partial"
          : "Autopay off";
    if (family.readiness === "ready") {
      return `${formatCents(family.balanceDueCents)} · ${family.status} · ${autopayLabel}`;
    }
    return "Setup needed";
  };

  const autopayBadgeStyle = (status: FamilyBillingSummary["autopayStatus"]) => {
    if (status === "on") {
      return { backgroundColor: C.accentLight, color: C.accent };
    }
    if (status === "partial") {
      return { backgroundColor: C.elevated, color: C.warning };
    }
    return { backgroundColor: C.elevated, color: C.textSecondary };
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

  const assignmentContextByAssignmentId = useMemo(() => {
    if (!selectedFamily) {
      return new Map<string, { studentName: string | null; enrollmentId: string }>();
    }
    return new Map(
      selectedFamily.assignments.map((assignment) => [
        assignment.assignmentId,
        {
          studentName: assignment.studentName,
          enrollmentId: assignment.enrollmentId,
        },
      ]),
    );
  }, [selectedFamily]);

  const hasMultipleStudents = (selectedFamily?.assignments.length ?? 0) > 1;

  const studentColorMap = useMemo(() => {
    if (!selectedFamily) return new Map<string, number>();
    return buildStudentColorIndexMap(
      selectedFamily.assignments.map((assignment) => assignment.enrollmentId),
    );
  }, [selectedFamily]);

  const upcomingFamilyCharges = useMemo(
    () =>
      displayedFamilyCharges.filter((charge) =>
        OPEN_CHARGE_STATUSES.has(charge.status),
      ),
    [displayedFamilyCharges],
  );

  const resolveStudentBadgeForAssignment = (assignmentId: string) => {
    if (!hasMultipleStudents) return null;
    const context = assignmentContextByAssignmentId.get(assignmentId);
    if (!context?.studentName) return null;
    const firstName = childFirstNameFromFullName(context.studentName);
    const badgeColors = getStudentBadgeColors(
      C,
      studentColorMap.get(context.enrollmentId) ?? 0,
    );
    return { firstName, badgeColors };
  };

  const resolveStudentBadgeForPayment = (tuitionChargeId: string | null) => {
    if (!tuitionChargeId) return null;
    const charge = familyCharges.find((item) => item.id === tuitionChargeId);
    if (!charge) return null;
    return resolveStudentBadgeForAssignment(charge.assignmentId);
  };

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
            onClick={() => selectFamily(family.familyId)}
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

          <TuitionFamilyTabBar
            C={C}
            activeTab={activeFamilyTab}
            onTabChange={setActiveFamilyTab}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFamilyTab}
              variants={tabPanelVariants(reducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabPanelTransition(reducedMotion)}
            >
          {activeFamilyTab === "assignments" ? (
            <div
              className="flex flex-col gap-4"
              id="tuition-family-panel-assignments"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-assignments"
              data-testid="tuition-family-panel-assignments"
            >
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
                              aria-label={
                                assignment.pendingPaymentPlanSelection
                                  ? `Set payment schedule for ${assignment.studentName ?? "student"}`
                                  : `Edit tier and schedule for ${assignment.studentName ?? "student"}`
                              }
                            >
                              {assignment.pendingPaymentPlanSelection
                                ? "Set schedule"
                                : "Edit"}
                            </button>
                            <button
                              type="button"
                              disabled={assignment.pendingPaymentPlanSelection}
                              title={
                                assignment.pendingPaymentPlanSelection
                                  ? "Set a payment schedule before applying discounts"
                                  : undefined
                              }
                              aria-label={
                                assignment.pendingPaymentPlanSelection
                                  ? `Set a payment schedule before applying discounts for ${assignment.studentName ?? "student"}`
                                  : `Adjust tuition for ${assignment.studentName ?? "student"}`
                              }
                              onClick={() =>
                                onAdjust(
                                  selectedFamily.familyId,
                                  assignment.assignmentId,
                                  assignment.studentName,
                                )
                              }
                              className="text-xs font-medium px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: C.accentLight, color: C.accent }}
                            >
                              Adjust tuition
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
              ) : selectedFamily.readiness !== "needs_assignment" ? (
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  No enrollment assignments yet.
                </p>
              ) : null}
            </div>
          ) : null}

          {activeFamilyTab === "balance" ? (
            <div
              id="tuition-family-panel-balance"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-balance"
              data-testid="tuition-family-panel-balance"
            >
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
            </div>
          ) : null}

          {activeFamilyTab === "autopay" ? (
            <div
              className="rounded-lg p-4 flex flex-col gap-3"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              id="tuition-family-panel-autopay"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-autopay"
              data-testid="tuition-family-panel-autopay"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  Autopay
                </p>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={autopayBadgeStyle(selectedFamily.autopayStatus)}
                >
                  {selectedFamily.autopayStatus === "on"
                    ? "On"
                    : selectedFamily.autopayStatus === "partial"
                      ? "Partial"
                      : "Off"}
                </span>
              </div>

              {selectedFamily.guardianAutopay.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {selectedFamily.guardianAutopay.map((guardian) => (
                    <li
                      key={guardian.guardianId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span style={{ color: C.textPrimary }}>{guardian.name}</span>
                      <span className="text-xs" style={{ color: C.textSecondary }}>
                        Autopay {guardian.autopayEnabled ? "on" : "off"} · Card{" "}
                        {guardian.hasPaymentMethod ? "on file" : "missing"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  Card on file: {selectedFamily.hasPaymentMethod ? "Yes" : "No"}
                </p>
              )}

              {selectedFamily.lastAutopayFailedAt ? (
                <p className="text-xs" style={{ color: C.error }}>
                  Last autopay failed on{" "}
                  {new Date(selectedFamily.lastAutopayFailedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          ) : null}

          {activeFamilyTab === "schedule" ? (
            <div
              id="tuition-family-panel-schedule"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-schedule"
              data-testid="tuition-family-panel-schedule"
            >
              <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
                Schedule
              </p>
              <div className="flex flex-col gap-2">
                {upcomingFamilyCharges.length > 0 ? (
                  upcomingFamilyCharges.map((charge) => {
                    const studentBadge = resolveStudentBadgeForAssignment(
                      charge.assignmentId,
                    );
                    return (
                    <div
                      key={charge.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm"
                      style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {studentBadge ? (
                            <TuitionStudentBadge
                              firstName={studentBadge.firstName}
                              badgeColors={studentBadge.badgeColors}
                            />
                          ) : null}
                          <p style={{ color: C.textPrimary }}>{charge.label}</p>
                        </div>
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
                              onClick={() =>
                                setManualPaymentCharge({
                                  id: charge.id,
                                  label: charge.label,
                                  amountCents: charge.amountCents,
                                  paidCents: charge.paidCents,
                                })
                              }
                              className="text-xs font-medium px-2 py-1 rounded"
                              style={{ backgroundColor: C.accentLight, color: C.accent }}
                            >
                              Mark paid
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    );
                  })
                ) : displayedFamilyCharges.length > 0 ? (
                  <p
                    className="text-sm px-3 py-2 rounded-md"
                    style={{
                      color: C.textSecondary,
                      backgroundColor: C.bg,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    No upcoming charges. Paid installments appear in Payment history.
                  </p>
                ) : (
                  <p
                    className="text-sm px-3 py-2 rounded-md"
                    style={{
                      color: C.textSecondary,
                      backgroundColor: C.bg,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    No charges yet. Assign a rate plan and choose a payment schedule to generate
                    the billing schedule.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {activeFamilyTab === "payments" ? (
            <div
              id="tuition-family-panel-payments"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-payments"
              data-testid="tuition-family-panel-payments"
            >
              <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
                Payment history
              </p>
              {displayedFamilyPayments.some((payment) => payment.status === "succeeded") ? (
                <div className="flex flex-col gap-2">
                  {displayedFamilyPayments
                    .filter((payment) => payment.status === "succeeded")
                    .map((payment) => {
                      const studentBadge = resolveStudentBadgeForPayment(
                        payment.tuitionChargeId,
                      );
                      return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {studentBadge ? (
                              <TuitionStudentBadge
                                firstName={studentBadge.firstName}
                                badgeColors={studentBadge.badgeColors}
                              />
                            ) : null}
                            <p style={{ color: C.textPrimary }}>
                              {payment.label ?? "Tuition payment"}
                            </p>
                          </div>
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
                            style={{
                              backgroundColor: C.bg,
                              color: C.textPrimary,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            Refund
                          </button>
                        </div>
                      </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  No payments recorded yet.
                </p>
              )}
            </div>
          ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      <TuitionBillingSplitModal
        open={splitModalOpen && selectedFamily != null}
        familyId={selectedFamily?.familyId ?? ""}
        familyName={selectedFamily?.familyName ?? ""}
        branding={branding}
        onClose={() => setSplitModalOpen(false)}
        onSaved={() => void loadFamilies()}
      />

      <TuitionManualPaymentModal
        open={manualPaymentCharge != null}
        charge={manualPaymentCharge}
        branding={branding}
        saving={manualPaymentCharge != null && actionLoading === manualPaymentCharge.id}
        onClose={() => setManualPaymentCharge(null)}
        onConfirm={handleManualPayment}
      />
    </div>
  );
}
