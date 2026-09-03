"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import TuitionBillingSplitModal from "@/components/school-admin/tuition/TuitionBillingSplitModal";
import TuitionFamilyListSidebar, {
  EnrollmentStatusChip,
} from "@/components/school-admin/tuition/TuitionFamilyListSidebar";
import TuitionFamilyTabBar from "@/components/school-admin/tuition/TuitionFamilyTabBar";
import TuitionManualPaymentModal from "@/components/school-admin/tuition/TuitionManualPaymentModal";
import TuitionStudentBadge from "@/components/school-admin/tuition/TuitionStudentBadge";
import {
  DEFAULT_TUITION_FAMILY_TAB,
  type TuitionFamilyTabId,
} from "@/components/school-admin/tuition/tuition-family-tabs";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import { childFirstNameFromFullName } from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import {
  buildStudentColorIndexMap,
  getStudentBadgeColors,
} from "@/lib/tuition/student-badge-colors";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  assignTuitionLabel,
  partitionUnassignedEnrollments,
} from "@/lib/tuition/tuition-readiness";
import type {
  CatalogTuitionSummary,
  FamilyAssignmentSummary,
  FamilyBillingSummary,
  UnassignedEnrollmentSummary,
} from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

const FAMILIES_PAGE_SIZE = 50;

async function fetchFamiliesPage(
  organizationId: string,
  offset: number,
): Promise<{
  families: FamilyBillingSummary[];
  hasMore: boolean;
}> {
  const params = new URLSearchParams({
    organizationId,
    limit: String(FAMILIES_PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`/api/school-admin/tuition/families?${params}`);
  const payload = (await response.json()) as {
    families?: FamilyBillingSummary[];
    hasMore?: boolean;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load families.");
  }
  return {
    families: payload.families ?? [],
    hasMore: payload.hasMore ?? false,
  };
}

type TuitionFamiliesPanelProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  reloadToken?: number;
  initialFamilyId?: string | null;
  onAdjust: (familyId: string, assignmentId: string, studentName: string | null) => void;
  onEditAssignment: (assignmentId: string) => void;
  onRefresh: () => void;
};

function CatalogTuitionAmount({
  catalogTuition,
  theme,
  size = "lg",
}: {
  catalogTuition: CatalogTuitionSummary;
  theme: ParentThemeTokens;
  size?: "lg" | "sm";
}) {
  const hasDiscount = catalogTuition.baseCents !== catalogTuition.adjustedCents;
  const amountClass = size === "lg" ? "text-lg font-semibold" : "text-sm font-medium";

  return (
    <p className={`${amountClass} flex items-center gap-2`} style={{ color: theme.ink }}>
      {hasDiscount ? (
        <>
          <span style={{ color: theme.muted, textDecoration: "line-through" }}>
            {formatCents(catalogTuition.baseCents)}
          </span>
          <span>{formatCents(catalogTuition.adjustedCents)}</span>
        </>
      ) : (
        <span>{formatCents(catalogTuition.adjustedCents)}</span>
      )}
    </p>
  );
}

function UnassignedStudentRow({
  enrollment,
  theme,
}: {
  enrollment: UnassignedEnrollmentSummary;
  theme: ParentThemeTokens;
}) {
  return (
    <li className="flex flex-col gap-1 text-sm">
      <span className="font-medium" style={{ color: theme.ink }}>
        {enrollment.studentName}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <EnrollmentStatusChip status={enrollment.status} theme={theme} />
        <AdminChip theme={theme} tone="purple">
          {enrollment.programName}
        </AdminChip>
      </div>
    </li>
  );
}

function AssignmentMetaBadges({
  assignment,
  theme,
}: {
  assignment: FamilyAssignmentSummary;
  theme: ParentThemeTokens;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <EnrollmentStatusChip status={assignment.enrollmentStatus} theme={theme} />
      <AdminChip theme={theme} tone="info">
        {assignment.ratePlanName}
      </AdminChip>
      {assignment.tierLabel ? (
        <AdminChip theme={theme} tone="info">
          {assignment.tierLabel}
        </AdminChip>
      ) : null}
      {!assignment.pendingPaymentPlanSelection ? (
        <AdminChip theme={theme} tone="info">
          {assignment.paymentPlanLabel}
        </AdminChip>
      ) : null}
      {assignment.pendingPaymentPlanSelection ? (
        <AdminChip theme={theme} tone="warning">
          Awaiting schedule choice
        </AdminChip>
      ) : null}
      {assignment.activeAdjustmentCount > 0 && assignment.adjustmentSummaryLabel ? (
        <AdminChip
          theme={theme}
          tone="success"
          className="max-w-full truncate"
        >
          <span title={assignment.adjustmentSummaryFull ?? assignment.adjustmentSummaryLabel}>
            {assignment.adjustmentSummaryLabel}
          </span>
        </AdminChip>
      ) : null}
    </div>
  );
}

export default function TuitionFamiliesPanel({
  organizationId,
  slug,
  branding,
  reloadToken = 0,
  initialFamilyId = null,
  onAdjust,
  onEditAssignment,
  onRefresh,
}: TuitionFamiliesPanelProps) {
  void branding;
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);
  const [familySearchQuery, setFamilySearchQuery] = useState("");
  const reducedMotion = useReducedMotion() ?? false;
  const [families, setFamilies] = useState<FamilyBillingSummary[]>([]);
  const [hasMoreFamilies, setHasMoreFamilies] = useState(false);
  const [loadingMoreFamilies, setLoadingMoreFamilies] = useState(false);
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
  const [familyCharges, setFamilyCharges] = useState<
    Awaited<ReturnType<typeof listChargesForFamily>>
  >([]);
  const [familyPayments, setFamilyPayments] = useState<PaymentRecord[]>([]);
  const selectedFamilyIdRef = useRef<string | null>(null);

  const selectFamily = useCallback((familyId: string) => {
    selectedFamilyIdRef.current = familyId;
    setSelectedFamilyId(familyId);
    setActiveFamilyTab(DEFAULT_TUITION_FAMILY_TAB);
  }, []);

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const { families: rows, hasMore } = await fetchFamiliesPage(organizationId, 0);
      setFamilies(rows);
      setHasMoreFamilies(hasMore);
      const prev = selectedFamilyIdRef.current;
      const preferred =
        initialFamilyId && rows.some((row) => row.familyId === initialFamilyId)
          ? initialFamilyId
          : null;
      const next =
        preferred ??
        (prev && rows.some((r) => r.familyId === prev) ? prev : rows[0]?.familyId ?? null);
      if (next !== prev) {
        setActiveFamilyTab(DEFAULT_TUITION_FAMILY_TAB);
      }
      selectedFamilyIdRef.current = next;
      setSelectedFamilyId(next);
    } finally {
      setLoading(false);
    }
  }, [initialFamilyId, organizationId]);

  const loadMoreFamilies = useCallback(async () => {
    if (!hasMoreFamilies || loadingMoreFamilies) return;
    setLoadingMoreFamilies(true);
    try {
      const { families: rows, hasMore } = await fetchFamiliesPage(
        organizationId,
        families.length,
      );
      setFamilies((prev) => {
        const existing = new Set(prev.map((family) => family.familyId));
        const merged = [...prev];
        for (const row of rows) {
          if (!existing.has(row.familyId)) merged.push(row);
        }
        return merged;
      });
      setHasMoreFamilies(hasMore);
    } finally {
      setLoadingMoreFamilies(false);
    }
  }, [families.length, hasMoreFamilies, loadingMoreFamilies, organizationId]);

  const refreshFamilySummaries = useCallback(async () => {
    const { families: rows, hasMore } = await fetchFamiliesPage(organizationId, 0);
    setFamilies(rows);
    setHasMoreFamilies(hasMore);
    return rows;
  }, [organizationId]);

  const refreshSelectedFamilyDetails = useCallback(async (familyId: string) => {
    const [charges, payments] = await Promise.all([
      listChargesForFamily(supabase, familyId),
      listTuitionPaymentsForFamily(supabase, familyId),
    ]);
    setFamilyCharges(charges);
    setFamilyPayments(payments);
  }, [supabase]);

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
      await refreshFamilySummaries();
      if (selectedFamilyId) {
        await refreshSelectedFamilyDetails(selectedFamilyId);
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
      await refreshFamilySummaries();
      if (selectedFamilyId) {
        await refreshSelectedFamilyDetails(selectedFamilyId);
      }
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
      await refreshFamilySummaries();
      if (selectedFamilyId) {
        await refreshSelectedFamilyDetails(selectedFamilyId);
      }
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
      adminToast.success("Tuition assigned");
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

  const autopayChipTone = (
    status: FamilyBillingSummary["autopayStatus"],
  ): "success" | "warning" | "info" => {
    if (status === "on") return "success";
    if (status === "partial") return "warning";
    return "info";
  };

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
    return <SchoolAdminSplitPaneSkeleton C={C} label="Loading families" />;
  }

  if (!families.length) {
    return (
      <AdminCard theme={theme} padding="canvas" className="text-center">
        <p className="text-lg font-semibold font-heading" style={{ color: theme.ink }}>
          No family billing yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: theme.muted }}>
          When students enroll and are assigned a rate plan, families will appear here
          with their tuition schedule and balance.
        </p>
      </AdminCard>
    );
  }

  const detailPane = selectedFamily ? (
    <AdminCard theme={theme} padding="canvas" className="flex min-h-[420px] flex-col gap-4">
      {invoiceNotice ? (
        <p
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            backgroundColor: "#F4F8F4",
            color: theme.muted,
            borderColor: "#DCE4DC",
          }}
          data-testid="tuition-invoice-notice"
        >
          {invoiceNotice}
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className="font-heading text-base font-semibold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {selectedFamily.familyName}
          </h2>
          {selectedFamily.billingSplitSummary ? (
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              Split billing: {selectedFamily.billingSplitSummary}
            </p>
          ) : null}
        </div>
        <AdminButton
          theme={theme}
          variant="outline"
          size="compact"
          onClick={() => setSplitModalOpen(true)}
          data-testid="tuition-billing-split-button"
        >
          Billing split
        </AdminButton>
      </div>

      {panelError ? (
        <p className="text-sm" style={{ color: "#AD574C" }}>
          {panelError}
        </p>
      ) : null}

      <TuitionFamilyTabBar
        theme={theme}
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
              {(() => {
                const assignedEnrollmentIds = new Set(
                  selectedFamily.assignments.map((assignment) => assignment.enrollmentId),
                );
                const { enrolling, enrolledUnassigned } = partitionUnassignedEnrollments(
                  selectedFamily.unassignedEnrollments,
                );
                const enrollingWithoutAssignment = enrolling.filter(
                  (enrollment) => !assignedEnrollmentIds.has(enrollment.enrollmentId),
                );

                return (
                  <>
                    {enrollingWithoutAssignment.length > 0 ? (
                      <div
                        className="rounded-lg p-4 flex flex-col gap-3"
                        style={{
                          backgroundColor: "#EAF4EB",
                          border: "1px solid #C7DFCB",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: theme.ink }}>
                            Enrollment in progress
                          </p>
                          <p className="text-sm mt-1" style={{ color: theme.muted }}>
                            Tuition rate is set. Installments are created when enrollment is complete.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <ul className="flex flex-col gap-2">
                            {enrollingWithoutAssignment.map((enrollment) => (
                              <UnassignedStudentRow
                                key={enrollment.enrollmentId}
                                enrollment={enrollment}
                                theme={theme}
                              />
                            ))}
                          </ul>
                          <AdminButton
                            theme={theme}
                            variant="primary"
                            size="compact"
                            className="self-start"
                            disabled={actionLoading === "sync"}
                            onClick={() => void handleSyncAssignments()}
                          >
                            {assignTuitionLabel(enrollingWithoutAssignment.length)}
                          </AdminButton>
                        </div>
                      </div>
                    ) : null}

                    {enrolledUnassigned.length > 0 ? (
                      <div
                        className="rounded-lg p-4 flex flex-col gap-3"
                        style={{
                          backgroundColor: "#EAF4EB",
                          border: "1px solid #C7DFCB",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: theme.ink }}>
                            Tuition not assigned yet
                          </p>
                          <p className="text-sm mt-1" style={{ color: theme.muted }}>
                            These students are enrolled but don&apos;t have a rate plan applied.
                            This usually means they enrolled before your rate plan was ready.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <ul className="flex flex-col gap-2">
                            {enrolledUnassigned.map((enrollment) => (
                              <UnassignedStudentRow
                                key={enrollment.enrollmentId}
                                enrollment={enrollment}
                                theme={theme}
                              />
                            ))}
                          </ul>
                          <AdminButton
                            theme={theme}
                            variant="primary"
                            size="compact"
                            className="self-start"
                            disabled={actionLoading === "sync"}
                            onClick={() => void handleSyncAssignments()}
                          >
                            {assignTuitionLabel(enrolledUnassigned.length)}
                          </AdminButton>
                        </div>
                      </div>
                    ) : null}
                  </>
                );
              })()}

              {selectedFamily.assignments.length > 0 ? (
                <div
                  className="rounded-lg p-4 flex flex-col gap-3"
                  style={{ backgroundColor: "#F4F8F4", border: "1px solid #E0E7E0" }}
                >
                  <p className="text-sm font-medium" style={{ color: theme.ink }}>
                    Enrollment assignments
                  </p>
                  {selectedFamily.readiness === "no_charges" ? (
                    <p className="text-sm" style={{ color: theme.muted }}>
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
                          <span style={{ color: theme.ink }}>
                            {assignment.studentName ?? "Student"}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <AdminButton
                              theme={theme}
                              variant="outline"
                              size="compact"
                              onClick={() => onEditAssignment(assignment.assignmentId)}
                              aria-label={
                                assignment.pendingPaymentPlanSelection
                                  ? `Set payment schedule for ${assignment.studentName ?? "student"}`
                                  : `Edit tier and schedule for ${assignment.studentName ?? "student"}`
                              }
                            >
                              {assignment.pendingPaymentPlanSelection
                                ? "Set schedule"
                                : "Edit"}
                            </AdminButton>
                            <AdminButton
                              theme={theme}
                              variant="soft"
                              size="compact"
                              aria-label={`Adjust tuition for ${assignment.studentName ?? "student"}`}
                              onClick={() =>
                                onAdjust(
                                  selectedFamily.familyId,
                                  assignment.assignmentId,
                                  assignment.studentName,
                                )
                              }
                            >
                              Adjust tuition
                            </AdminButton>
                            <AdminButton
                              theme={theme}
                              variant="outline"
                              size="compact"
                              disabled={actionLoading === assignment.assignmentId}
                              onClick={() => void handleUnassign(assignment.assignmentId)}
                            >
                              Unassign
                            </AdminButton>
                          </div>
                        </div>
                        <AssignmentMetaBadges assignment={assignment} theme={theme} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (() => {
                const assignedEnrollmentIds = new Set(
                  selectedFamily.assignments.map((assignment) => assignment.enrollmentId),
                );
                const { enrolling, enrolledUnassigned } = partitionUnassignedEnrollments(
                  selectedFamily.unassignedEnrollments,
                );
                const enrollingWithoutAssignment = enrolling.filter(
                  (enrollment) => !assignedEnrollmentIds.has(enrollment.enrollmentId),
                );
                const showEmptyState =
                  enrollingWithoutAssignment.length === 0 &&
                  enrolledUnassigned.length === 0;

                return showEmptyState ? (
                  <p className="text-sm" style={{ color: theme.muted }}>
                    No enrollment assignments yet.
                  </p>
                ) : null;
              })()}
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
                  <p className="text-xs uppercase" style={{ color: theme.muted }}>
                    {selectedFamily.catalogTuition ? "Tuition rate" : "Balance due"}
                  </p>
                  {selectedFamily.catalogTuition ? (
                    <CatalogTuitionAmount
                      catalogTuition={selectedFamily.catalogTuition}
                      theme={theme}
                    />
                  ) : (
                    <p className="text-lg font-semibold" style={{ color: theme.ink }}>
                      {formatCents(selectedFamily.balanceDueCents)}
                    </p>
                  )}
                  {selectedFamily.catalogTuition && selectedFamily.hasPendingEnrollment ? (
                    <p className="text-xs mt-1" style={{ color: theme.muted }}>
                      Billing starts after enrollment is complete.
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs uppercase" style={{ color: theme.muted }}>
                    Paid YTD
                  </p>
                  <p className="text-lg font-semibold" style={{ color: theme.ink }}>
                    {formatCents(selectedFamily.paidYtdCents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase" style={{ color: theme.muted }}>
                    Next due
                  </p>
                  <p className="text-sm font-medium" style={{ color: theme.ink }}>
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
              style={{ backgroundColor: "#F4F8F4", border: "1px solid #E0E7E0" }}
              id="tuition-family-panel-autopay"
              role="tabpanel"
              aria-labelledby="tuition-family-tab-autopay"
              data-testid="tuition-family-panel-autopay"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium" style={{ color: theme.ink }}>
                  Autopay
                </p>
                <AdminChip theme={theme} tone={autopayChipTone(selectedFamily.autopayStatus)}>
                  {selectedFamily.autopayStatus === "on"
                    ? "On"
                    : selectedFamily.autopayStatus === "partial"
                      ? "Partial"
                      : "Off"}
                </AdminChip>
              </div>

              {selectedFamily.guardianAutopay.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {selectedFamily.guardianAutopay.map((guardian) => (
                    <li
                      key={guardian.guardianId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span style={{ color: theme.ink }}>{guardian.name}</span>
                      <span className="text-xs" style={{ color: theme.muted }}>
                        Autopay {guardian.autopayEnabled ? "on" : "off"} · Card{" "}
                        {guardian.hasPaymentMethod ? "on file" : "missing"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  Card on file: {selectedFamily.hasPaymentMethod ? "Yes" : "No"}
                </p>
              )}

              {selectedFamily.lastAutopayFailedAt ? (
                <p className="text-xs" style={{ color: "#AD574C" }}>
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
              <p className="text-sm font-medium mb-2" style={{ color: theme.ink }}>
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
                      style={{ backgroundColor: "#F4F8F4", border: "1px solid #E0E7E0" }}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {studentBadge ? (
                            <TuitionStudentBadge
                              firstName={studentBadge.firstName}
                              badgeColors={studentBadge.badgeColors}
                            />
                          ) : null}
                          <p style={{ color: theme.ink }}>{charge.label}</p>
                        </div>
                        <p className="text-xs" style={{ color: theme.muted }}>
                          Due {charge.dueDate} · {charge.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: theme.ink }}>
                          {formatCents(charge.amountCents)}
                        </span>
                        {charge.status !== "paid" && charge.status !== "void" ? (
                          <>
                            {charge.status === "scheduled" ? (
                              <AdminButton
                                theme={theme}
                                variant="primary"
                                size="compact"
                                disabled={actionLoading === charge.id}
                                onClick={() => void handleSendInvoice(charge.id)}
                              >
                                Send invoice
                              </AdminButton>
                            ) : null}
                            <AdminButton
                              theme={theme}
                              variant="soft"
                              size="compact"
                              disabled={actionLoading === charge.id}
                              onClick={() =>
                                setManualPaymentCharge({
                                  id: charge.id,
                                  label: charge.label,
                                  amountCents: charge.amountCents,
                                  paidCents: charge.paidCents,
                                })
                              }
                            >
                              Mark paid
                            </AdminButton>
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
                      color: theme.muted,
                      backgroundColor: "#F4F8F4",
                      border: "1px solid #E0E7E0",
                    }}
                  >
                    No upcoming charges. Paid installments appear in Payment history.
                  </p>
                ) : (
                  <p
                    className="text-sm px-3 py-2 rounded-md"
                    style={{
                      color: theme.muted,
                      backgroundColor: "#F4F8F4",
                      border: "1px solid #E0E7E0",
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
              <p className="text-sm font-medium mb-2" style={{ color: theme.ink }}>
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
                        style={{ backgroundColor: "#F4F8F4", border: "1px solid #E0E7E0" }}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {studentBadge ? (
                              <TuitionStudentBadge
                                firstName={studentBadge.firstName}
                                badgeColors={studentBadge.badgeColors}
                              />
                            ) : null}
                            <p style={{ color: theme.ink }}>
                              {payment.label ?? "Tuition payment"}
                            </p>
                          </div>
                          <p className="text-xs" style={{ color: theme.muted }}>
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : payment.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: theme.ink }}>
                            {formatCents(payment.amountCents)}
                          </span>
                          <AdminButton
                            theme={theme}
                            variant="outline"
                            size="compact"
                            disabled={actionLoading === payment.id}
                            onClick={() => void handleRefund(payment.id)}
                          >
                            Refund
                          </AdminButton>
                        </div>
                      </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No payments recorded yet.
                </p>
              )}
            </div>
          ) : null}
            </motion.div>
          </AnimatePresence>
    </AdminCard>
  ) : (
    <AdminCard theme={theme} padding="canvas">
      <p className="text-sm" style={{ color: theme.muted }}>
        Select a family from the list to view billing details.
      </p>
    </AdminCard>
  );

  return (
    <>
      <div className="mb-3 lg:hidden">
        <TuitionFamilyListSidebar
          families={families}
          selectedId={selectedFamilyId}
          onSelect={selectFamily}
          theme={theme}
          layout="strip"
          searchQuery={familySearchQuery}
          onSearchChange={setFamilySearchQuery}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <TuitionFamilyListSidebar
            families={families}
            selectedId={selectedFamilyId}
            onSelect={selectFamily}
            theme={theme}
            hasMore={hasMoreFamilies}
            loadingMore={loadingMoreFamilies}
            onLoadMore={() => void loadMoreFamilies()}
            searchQuery={familySearchQuery}
            onSearchChange={setFamilySearchQuery}
          />
        </div>
        {detailPane}
      </div>

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
    </>
  );
}
