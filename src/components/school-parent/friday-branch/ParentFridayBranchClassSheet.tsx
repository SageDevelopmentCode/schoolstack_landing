"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Loader2, X } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchStudentEnrollmentState,
  ParentFridayBranchStudentOption,
} from "@/lib/parent-portal/friday-branch/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  formatFridayBranchSpotsLabel,
  getFridayBranchChildChipPresentation,
  getInitialFridayBranchChildSelection,
  isFridayBranchChildChipDisabled,
  partitionFridayBranchChildSelection,
  syncFridayBranchChildSelection,
  type FridayBranchChildChipIcon,
} from "./friday-branch-parent-utils";
import ParentFridayBranchClassSheetSkeleton from "./ParentFridayBranchClassSheetSkeleton";

type ParentFridayBranchClassSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  classId: string | null;
  fallbackSummary?: ParentFridayBranchClassSummary | null;
  blockLabel?: string;
  blockDateRange?: string;
  studentOptions: ParentFridayBranchStudentOption[];
  readOnly?: boolean;
  previewFamilyId?: string;
  onClose: () => void;
  onEnrollmentChange: (classId: string, detail: ParentFridayBranchClassDetailBundle) => void;
};

function toggleStudentSelection(
  current: Set<string>,
  studentId: string,
): Set<string> {
  const next = new Set(current);
  if (next.has(studentId)) next.delete(studentId);
  else next.add(studentId);
  return next;
}

function DetailRow({
  label,
  children,
  theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: ParentThemeTokens;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: theme.muted }}
      >
        {label}
      </div>
      <div className="mt-1 text-sm" style={{ color: theme.ink }}>
        {children}
      </div>
    </div>
  );
}

function FridayBranchChildChipIcon({
  icon,
}: {
  icon: FridayBranchChildChipIcon;
}) {
  if (icon === "check") {
    return <Check className="h-4 w-4 shrink-0" aria-hidden="true" />;
  }
  return <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />;
}

export default function ParentFridayBranchClassSheet({
  theme,
  open,
  organizationId,
  classId,
  fallbackSummary = null,
  blockLabel,
  blockDateRange,
  studentOptions,
  readOnly = false,
  previewFamilyId,
  onClose,
  onEnrollmentChange,
}: ParentFridayBranchClassSheetProps) {
  const [detail, setDetail] = useState<ParentFridayBranchClassDetailBundle | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"enroll" | "withdraw" | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !classId) {
      queueMicrotask(() => {
        setDetail(null);
        setSelectedStudentIds(new Set());
        setLoadError(null);
        setActionError(null);
      });
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      async function loadDetail() {
        const activeClassId = classId;
        if (!activeClassId) return;

        setIsLoading(true);
        setLoadError(null);
        setActionError(null);

        let response: Response | undefined;
        try {
          if (readOnly && previewFamilyId) {
            const query = new URLSearchParams({ familyId: previewFamilyId }).toString();
            response = await fetch(
              `/api/admin/organizations/${encodeURIComponent(organizationId)}/friday-branch/classes/${encodeURIComponent(activeClassId)}?${query}`,
            );
          } else {
            const query = new URLSearchParams({ organizationId }).toString();
            response = await fetch(
              `/api/parent-portal/friday-branch/classes/${encodeURIComponent(activeClassId)}?${query}`,
            );
          }
          const payload = (await response.json()) as {
            detail?: ParentFridayBranchClassDetailBundle;
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Failed to load class.");
          }

          if (cancelled) return;
          const nextDetail = payload.detail ?? null;
          setDetail(nextDetail);
          setSelectedStudentIds(
            new Set(getInitialFridayBranchChildSelection(nextDetail?.studentStates ?? [])),
          );
        } catch (error) {
          if (cancelled) return;
          setLoadError(error instanceof Error ? error.message : "Failed to load class.");
          void reportPortalOperationalError(
            "parent_portal",
            {
              organizationId,
              operation: "friday_branch.class.detail.load",
              error: "",
            },
            error,
            response?.status,
          );
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }

      void loadDetail();
    });

    return () => {
      cancelled = true;
    };
  }, [classId, open, organizationId, previewFamilyId, readOnly, studentOptions]);

  const { enrollableIds, withdrawableIds } = useMemo(
    () =>
      partitionFridayBranchChildSelection(
        detail?.studentStates ?? [],
        selectedStudentIds,
      ),
    [detail?.studentStates, selectedStudentIds],
  );

  const displayName = detail?.name ?? fallbackSummary?.name ?? "Class details";
  const displaySlotTime = detail?.slotTime ?? fallbackSummary?.slotTime;
  const displayLocation = detail?.location ?? fallbackSummary?.location;
  const displayBlockLabel = detail?.blockLabel ?? blockLabel ?? "Schedule";
  const displayBlockDateRange = detail?.blockDateRange ?? blockDateRange;

  const spotsLabel = detail
    ? formatFridayBranchSpotsLabel({
        classId: detail.classId,
        slotId: detail.slotId,
        slotTime: detail.slotTime,
        name: detail.name,
        location: detail.location,
        ageGroup: detail.ageGroup,
        teacher: detail.teacher,
        capacity: detail.capacity,
        confirmedCount: detail.confirmedCount,
        spotsRemaining: detail.spotsRemaining,
        familyEnrollments: [],
      })
    : null;

  async function runAction(type: "enroll" | "withdraw", studentIds: string[]) {
    if (readOnly || !classId || studentIds.length === 0) return;

    setPendingAction(type);
    setActionError(null);

    let lastDetail: ParentFridayBranchClassDetailBundle | null = detail;
    let lastResponse: Response | undefined;

    try {
      for (const studentId of studentIds) {
        lastResponse = await fetch(
          `/api/parent-portal/friday-branch/classes/${encodeURIComponent(classId)}`,
          {
            method: type === "enroll" ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              studentId,
            }),
          },
        );

        const payload = (await lastResponse.json()) as {
          detail?: ParentFridayBranchClassDetailBundle;
          error?: string;
        };

        if (!lastResponse.ok) {
          throw new Error(payload.error ?? "Failed to update sign-up.");
        }

        if (!payload.detail) {
          throw new Error("Failed to update sign-up.");
        }

        lastDetail = payload.detail;
        setDetail(lastDetail);
      }

      if (!lastDetail) {
        throw new Error("Failed to update sign-up.");
      }

      setSelectedStudentIds(
        new Set(syncFridayBranchChildSelection(lastDetail.studentStates, selectedStudentIds)),
      );
      onEnrollmentChange(classId, lastDetail);
    } catch (error) {
      if (lastDetail && lastDetail !== detail) {
        setSelectedStudentIds(
          new Set(syncFridayBranchChildSelection(lastDetail.studentStates, selectedStudentIds)),
        );
        onEnrollmentChange(classId, lastDetail);
      }
      setActionError(error instanceof Error ? error.message : "Failed to update sign-up.");
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation:
            type === "enroll"
              ? "friday_branch.class.enroll"
              : "friday_branch.class.withdraw",
          error: "",
        },
        error,
        lastResponse?.status,
      );
    } finally {
      setPendingAction(null);
    }
  }

  function handleToggleStudent(student: ParentFridayBranchStudentEnrollmentState) {
    if (readOnly || isFridayBranchChildChipDisabled(student)) return;
    setSelectedStudentIds((current) => toggleStudentSelection(current, student.studentId));
  }

  const canEnroll = !readOnly && enrollableIds.length > 0;
  const canWithdraw = !readOnly && withdrawableIds.length > 0;
  const showFooter =
    !readOnly &&
    detail != null &&
    studentOptions.length > 0 &&
    (canEnroll || canWithdraw || actionError != null);
  const enrollLabel =
    detail?.spotsRemaining === 0
      ? `Join waitlist (${enrollableIds.length})`
      : `Sign up (${enrollableIds.length})`;

  return (
    <AnimatePresence>
      {open && classId ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-friday-branch-class-sheet"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-friday-branch-class-sheet-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,32rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="min-w-0">
                <p className="m-0 text-xs font-medium" style={{ color: theme.muted }}>
                  Friday Branch · {displayBlockLabel}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2
                    id="parent-friday-branch-class-sheet-title"
                    className="truncate text-base font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    {displayName}
                  </h2>
                  {displaySlotTime ? (
                    <span
                      className="inline-block rounded-[9px] px-2 py-1 text-[11px] font-extrabold"
                      style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                    >
                      {displaySlotTime}
                    </span>
                  ) : null}
                </div>
                {displayBlockDateRange || displayLocation ? (
                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {[displayBlockDateRange, displayLocation].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {isLoading ? (
                  <ParentFridayBranchClassSheetSkeleton theme={theme} />
                ) : loadError ? (
                  <p className="text-sm" style={{ color: theme.ink }}>{loadError}</p>
                ) : detail ? (
                  <div className="space-y-4">
                    <ParentCard theme={theme} className="p-4">
                      <ParentSectionKicker theme={theme}>Class details</ParentSectionKicker>
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        {spotsLabel ? (
                          <ParentChip
                            theme={theme}
                            tone={detail.spotsRemaining === 0 ? "warning" : "info"}
                          >
                            {spotsLabel}
                          </ParentChip>
                        ) : null}
                        {detail.ageGroup ? (
                          <span className="text-xs font-medium" style={{ color: theme.muted }}>
                            {detail.ageGroup}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-3">
                        {detail.location ? (
                          <DetailRow label="Location" theme={theme}>
                            {detail.location}
                          </DetailRow>
                        ) : null}
                        {detail.teacher ? (
                          <DetailRow label="Teacher" theme={theme}>
                            {detail.teacher}
                          </DetailRow>
                        ) : null}
                      </div>
                    </ParentCard>

                    {studentOptions.length === 0 ? (
                      <ParentCard theme={theme} className="p-4">
                        <p className="text-sm" style={{ color: theme.muted }}>
                          Add a child under My children before signing up.
                        </p>
                      </ParentCard>
                    ) : (
                      <ParentCard theme={theme} className="p-4">
                        <ParentSectionKicker theme={theme}>Choose children</ParentSectionKicker>
                        <p className="mb-4 text-sm" style={{ color: theme.muted }}>
                          Select who should join this class.
                        </p>
                        <div className="space-y-2.5">
                          {detail.studentStates.map((student) => {
                            const active = selectedStudentIds.has(student.studentId);
                            const disabled = readOnly || isFridayBranchChildChipDisabled(student);
                            const isEnrolled =
                              student.status === "confirmed" || student.status === "waitlisted";
                            const presentation = getFridayBranchChildChipPresentation(
                              student,
                              active,
                              theme,
                            );

                            return (
                              <div key={student.studentId} className="space-y-1">
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleToggleStudent(student)}
                                  aria-pressed={active}
                                  aria-label={presentation.ariaLabel}
                                  className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                  style={{
                                    backgroundColor: presentation.backgroundColor,
                                    color: presentation.color,
                                    borderColor: presentation.borderColor,
                                    boxShadow: presentation.boxShadow,
                                  }}
                                >
                                  {presentation.icon ? (
                                    <FridayBranchChildChipIcon icon={presentation.icon} />
                                  ) : null}
                                  <span className="flex-1 text-left">{student.studentName}</span>
                                  {active && !isEnrolled ? (
                                    <span
                                      className="text-xs font-semibold uppercase tracking-[0.06em]"
                                      style={{ color: presentation.color }}
                                    >
                                      Selected
                                    </span>
                                  ) : null}
                                </button>
                                {disabled && student.blockedReason ? (
                                  <p className="px-1 text-xs" style={{ color: theme.muted }}>
                                    {student.blockedReason}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </ParentCard>
                    )}
                  </div>
                ) : null}
              </div>

              {showFooter ? (
                <div
                  className="shrink-0 space-y-3 border-t px-5 py-4"
                  style={{ borderColor: theme.line, backgroundColor: theme.paper }}
                >
                  {detail?.spotsRemaining === 0 && canEnroll ? (
                    <p className="text-sm" style={{ color: theme.muted }}>
                      This class is full. You can join the waitlist.
                    </p>
                  ) : null}
                  {actionError ? (
                    <p className="text-sm" style={{ color: theme.alert }}>
                      {actionError}
                    </p>
                  ) : null}
                  {canEnroll ? (
                    <ParentButton
                      theme={theme}
                      variant="primary"
                      className="w-full"
                      disabled={pendingAction != null}
                      onClick={() => void runAction("enroll", enrollableIds)}
                    >
                      {pendingAction === "enroll" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        enrollLabel
                      )}
                    </ParentButton>
                  ) : null}
                  {canWithdraw ? (
                    <ParentButton
                      theme={theme}
                      variant="outline"
                      className="w-full"
                      disabled={pendingAction != null}
                      onClick={() => void runAction("withdraw", withdrawableIds)}
                    >
                      {pendingAction === "withdraw" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `Withdraw (${withdrawableIds.length})`
                      )}
                    </ParentButton>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
