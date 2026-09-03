"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import TuitionStudentBadge from "@/components/school-admin/tuition/TuitionStudentBadge";
import TuitionOutstandingPeriodSelect from "@/components/school-admin/tuition/TuitionOutstandingPeriodSelect";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  getTuitionKpiBreakdown,
  tuitionKpiBreakdownTitle,
  type TuitionKpiBreakdown,
  type TuitionKpiBreakdownKind,
} from "@/lib/tuition/kpi-breakdown";
import { childFirstNameFromFullName } from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import {
  buildStudentColorIndexMap,
  getStudentBadgeColors,
} from "@/lib/tuition/student-badge-colors";
import type { ChargeStatus } from "@/lib/tuition/types";
import {
  outstandingPeriodLabel,
  type OutstandingPeriod,
  type SchoolYearBounds,
} from "@/lib/tuition/outstanding-period";
import { createClient } from "@/utils/supabase/client";

type TuitionKpiBreakdownPanelProps = {
  open: boolean;
  kind: TuitionKpiBreakdownKind | null;
  organizationId: string;
  branding: OrganizationBranding;
  expectedTotalCents?: number;
  outstandingPeriod?: OutstandingPeriod;
  schoolYearBounds?: SchoolYearBounds;
  onOutstandingPeriodChange?: (period: OutstandingPeriod) => void;
  onClose: () => void;
  onOpenFamily?: (familyId: string) => void;
};

function formatBreakdownDate(iso: string, kind: TuitionKpiBreakdownKind): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  if (kind === "collected_ytd") {
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function chargeStatusLabel(status: ChargeStatus, kind: TuitionKpiBreakdownKind): string {
  if (kind === "collected_ytd") return "Paid";
  if (status === "overdue") return "Overdue";
  if (status === "sent") return "Invoice sent";
  if (status === "scheduled") return "Scheduled";
  return status;
}

export default function TuitionKpiBreakdownPanel({
  open,
  kind,
  organizationId,
  branding,
  expectedTotalCents,
  outstandingPeriod = "current_month",
  schoolYearBounds = { effectiveStart: null, effectiveEnd: null },
  onOutstandingPeriodChange,
  onClose,
  onOpenFamily,
}: TuitionKpiBreakdownPanelProps) {
  void branding;
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<TuitionKpiBreakdown | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !kind) {
      queueMicrotask(() => {
        setBreakdown(null);
        setError(null);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    void getTuitionKpiBreakdown(supabase, organizationId, kind, {
      outstandingPeriod: kind === "outstanding" ? outstandingPeriod : undefined,
      schoolYearBounds: kind === "outstanding" ? schoolYearBounds : undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setBreakdown(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load breakdown.");
        setBreakdown(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, open, organizationId, outstandingPeriod, schoolYearBounds, supabase]);

  const title = kind ? tuitionKpiBreakdownTitle(kind) : "Breakdown";
  const outstandingSubtitle =
    kind === "outstanding" ? outstandingPeriodLabel(outstandingPeriod) : null;
  const displayTotalCents =
    expectedTotalCents ??
    (kind === "at_risk" ? (breakdown?.familyCount ?? 0) : (breakdown?.totalCents ?? 0));

  return (
    <AnimatePresence>
      {open && kind ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,40rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: "#F8FAF8",
              borderLeft: "1px solid #E1E8E1",
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} breakdown`}
            data-testid="tuition-kpi-breakdown-panel"
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 px-4 py-4 sm:px-5"
              style={{ borderBottom: "1px solid #E1E8E1" }}
            >
              <div className="min-w-0">
                <AdminSectionKicker theme={theme}>Tuition overview</AdminSectionKicker>
                <AdminDisplayHeading theme={theme} as="h3" size="canvas" className="mt-1">
                  {title}
                </AdminDisplayHeading>
                {outstandingSubtitle ? (
                  <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                    {outstandingSubtitle}
                  </p>
                ) : null}
                {breakdown ? (
                  <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                    {breakdown.familyCount} famil{breakdown.familyCount === 1 ? "y" : "ies"}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-start gap-2">
                {kind === "outstanding" && onOutstandingPeriodChange ? (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <TuitionOutstandingPeriodSelect
                      value={outstandingPeriod}
                      onChange={onOutstandingPeriodChange}
                      schoolYearBounds={schoolYearBounds}
                      C={C}
                      ariaLabel="Outstanding time period"
                    />
                  </div>
                ) : null}
                <AdminButton theme={theme} variant="soft" size="compact" onClick={onClose} aria-label="Close breakdown">
                  <X className="h-4 w-4" />
                </AdminButton>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {loading ? (
                <div
                  className="flex items-center justify-center gap-2 py-16 text-sm"
                  style={{ color: C.textSecondary }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading breakdown…
                </div>
              ) : error ? (
                <p
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    color: C.error,
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {error}
                </p>
              ) : breakdown && breakdown.families.length === 0 ? (
                <p className="text-sm text-center py-12" style={{ color: C.textSecondary }}>
                  {kind === "collected_ytd"
                    ? "No tuition collected yet this year."
                    : kind === "outstanding"
                      ? `No outstanding balances for ${outstandingPeriodLabel(outstandingPeriod).toLowerCase()}.`
                      : "No families are currently at risk."}
                </p>
              ) : breakdown ? (
                <div className="flex flex-col gap-4">
                  {breakdown.families.map((family) => {
                    const studentColorMap = buildStudentColorIndexMap(
                      family.lines.map((line) => line.chargeId),
                    );

                    return (
                      <article
                        key={family.familyId}
                        className="rounded-lg p-4"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                              {family.familyName}
                            </p>
                            {family.children.length > 0 ? (
                              <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                                {family.children.join(", ")}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                              {formatCents(family.totalCents)}
                            </span>
                            {onOpenFamily ? (
                              <button
                                type="button"
                                onClick={() => onOpenFamily(family.familyId)}
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{
                                  backgroundColor: C.surface,
                                  color: C.accent,
                                  border: `1px solid ${C.border}`,
                                }}
                              >
                                View family
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {family.lines.map((line, index) => {
                            const firstName = line.studentName
                              ? childFirstNameFromFullName(line.studentName)
                              : null;
                            const badgeColors = firstName
                              ? getStudentBadgeColors(C, studentColorMap.get(line.chargeId) ?? index)
                              : null;

                            return (
                              <div
                                key={line.chargeId}
                                className="flex items-start justify-between gap-3 px-3 py-2 rounded-md text-sm"
                                style={{
                                  backgroundColor: C.surface,
                                  border: `1px solid ${C.border}`,
                                }}
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {firstName && badgeColors ? (
                                      <TuitionStudentBadge
                                        firstName={firstName}
                                        badgeColors={badgeColors}
                                      />
                                    ) : null}
                                    <p style={{ color: C.textPrimary }}>{line.label}</p>
                                  </div>
                                  <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                                    {line.studentName ?? "Family charge"} ·{" "}
                                    {formatBreakdownDate(line.date, kind)}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="font-medium" style={{ color: C.textPrimary }}>
                                    {formatCents(line.amountCents)}
                                  </span>
                                  <span
                                    className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor:
                                        line.status === "overdue" ? C.errorBg : C.accentLight,
                                      color:
                                        line.status === "overdue" ? C.error : C.accentDark,
                                    }}
                                  >
                                    {chargeStatusLabel(line.status, kind)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div
              className="flex shrink-0 items-center justify-between gap-3 border-t px-4 py-3 sm:px-5"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <span className="text-sm font-medium" style={{ color: C.textSecondary }}>
                Total
              </span>
              <span className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {kind === "at_risk"
                  ? `${displayTotalCents} ${displayTotalCents === 1 ? "family" : "families"}`
                  : formatCents(displayTotalCents)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
