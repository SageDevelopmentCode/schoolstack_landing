"use client";

import { CheckCircle2, LayoutGrid } from "lucide-react";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";

export const PARENT_BILLING_SUMMARY_TAB = "summary";

const BILLING_ACTIVE_TOOLTIP =
  "Tuition billing is active — payment schedule confirmed";

type ParentBillingNavProps = {
  C: AdminThemeTokens;
  summary: ParentBillingFamilySummary;
  childViews: ParentBillingChildView[];
  activeTabKey: string;
  onChange: (tabKey: string) => void;
};

function resolveSummaryNavSubtitle(summary: ParentBillingFamilySummary): string {
  if (summary.hasPendingSchedule && summary.balanceDueCents === 0) {
    return "Schedule needed";
  }
  if (summary.balanceDueCents > 0 && summary.nextCharge) {
    return `${formatCents(summary.balanceDueCents)} due ${formatBillingDueDate(summary.nextCharge.dueDate)}`;
  }
  if (summary.balanceDueCents > 0) {
    return `${formatCents(summary.balanceDueCents)} due`;
  }
  return "All paid up";
}

export default function ParentBillingNav({
  C,
  summary,
  childViews,
  activeTabKey,
  onChange,
}: ParentBillingNavProps) {
  const summaryActive = activeTabKey === PARENT_BILLING_SUMMARY_TAB;
  const summarySubtitle = resolveSummaryNavSubtitle(summary);

  return (
    <nav
      className="flex h-full flex-col gap-1 px-3 py-4 md:px-4"
      aria-label="Billing sections"
      data-testid="parent-billing-nav"
    >
      <button
        type="button"
        onClick={() => onChange(PARENT_BILLING_SUMMARY_TAB)}
        className="flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left text-sm transition-colors"
        style={{
          backgroundColor: summaryActive ? C.accentLight : "transparent",
          border: `1px solid ${summaryActive ? C.accent : "transparent"}`,
          color: C.textPrimary,
        }}
        aria-current={summaryActive ? "true" : undefined}
        data-testid="parent-billing-summary-nav"
      >
        <span className="flex items-center gap-2 font-medium">
          <LayoutGrid className="h-4 w-4 shrink-0" style={{ color: C.accent }} aria-hidden />
          Summary
        </span>
        <span className="text-xs pl-6" style={{ color: C.textSecondary }}>
          {summarySubtitle}
        </span>
      </button>

      <p
        className="px-3 pt-4 pb-2 text-xs font-medium uppercase tracking-wide"
        style={{ color: C.textTertiary }}
      >
        Students
      </p>

      {childViews.map((child) => {
        const active = child.childKey === activeTabKey;
        const firstName = childFirstNameFromFullName(child.studentName);

        return (
          <button
            key={child.childKey}
            type="button"
            onClick={() => onChange(child.childKey)}
            className="flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left text-sm transition-colors"
            style={{
              backgroundColor: active ? C.accentLight : "transparent",
              border: `1px solid ${active ? C.accent : "transparent"}`,
              color: C.textPrimary,
            }}
            aria-current={active ? "true" : undefined}
            data-testid={`parent-billing-child-summary-${child.childKey}`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              {firstName}
              {child.status === "ready" ? (
                <span
                  className="inline-flex shrink-0"
                  title={BILLING_ACTIVE_TOOLTIP}
                  aria-label={BILLING_ACTIVE_TOOLTIP}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5"
                    style={{ color: C.success }}
                    aria-hidden
                  />
                </span>
              ) : null}
              {child.status === "needs_schedule" ? (
                <ParentNeedsScheduleBadge C={C} label="Setup" size="sm" />
              ) : null}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              {child.balanceDueCents > 0 && child.nextCharge ? (
                <span
                  className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: active ? C.surface : C.accentLight,
                    color: C.accent,
                  }}
                >
                  Due {formatBillingDueDate(child.nextCharge.dueDate)} ·{" "}
                  {formatCents(child.balanceDueCents)}
                </span>
              ) : child.balanceDueCents > 0 ? (
                <span
                  className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: active ? C.surface : C.accentLight,
                    color: C.accent,
                  }}
                >
                  Due {formatCents(child.balanceDueCents)}
                </span>
              ) : (
                <span className="text-xs" style={{ color: C.textTertiary }}>
                  {child.paymentPlanLabel ??
                    `Annual ${formatCents(child.annualTuitionCents)}`}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
