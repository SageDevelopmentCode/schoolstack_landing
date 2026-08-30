"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import { parentBillingViewTransition } from "@/components/school-parent/billing/parent-billing-view-transition";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import {
  PARENT_BILLING_SUMMARY_TAB,
} from "@/components/school-parent/billing/ParentBillingNav";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentBillingStoryHeaderProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  activeTabKey: string;
  pendingTabKey?: string | null;
  loadingTabKey?: string | null;
  childViews: ParentBillingChildView[];
  openChargeCount: number;
  totalRemainingCents: number;
  onSelectTab: (tabKey: string) => void;
};

function resolveSubtitle(
  openChargeCount: number,
  totalRemainingCents: number,
): string {
  const paymentLabel =
    openChargeCount === 1 ? "1 payment remaining" : `${openChargeCount} payments remaining`;
  if (totalRemainingCents > 0) {
    return `${paymentLabel} · ${formatCents(totalRemainingCents)} left this school year`;
  }
  if (openChargeCount > 0) {
    return paymentLabel;
  }
  return "Your tuition schedule is up to date";
}

function isTabLoading(
  tabKey: string,
  pendingTabKey?: string | null,
  loadingTabKey?: string | null,
): boolean {
  return pendingTabKey === tabKey || loadingTabKey === tabKey;
}

export default function ParentBillingStoryHeader({
  theme,
  C,
  activeTabKey,
  pendingTabKey = null,
  loadingTabKey = null,
  childViews,
  openChargeCount,
  totalRemainingCents,
  onSelectTab,
}: ParentBillingStoryHeaderProps) {
  const hasMultipleChildren = childViews.length > 1;
  const isSummaryTab = activeTabKey === PARENT_BILLING_SUMMARY_TAB;
  const activeChild = childViews.find((child) => child.childKey === activeTabKey);

  const title = isSummaryTab || !activeChild
    ? "Family tuition"
    : `${childFirstNameFromFullName(activeChild.studentName)}'s tuition`;

  const subtitle = resolveSubtitle(openChargeCount, totalRemainingCents);
  const summaryTabLoading = isTabLoading(
    PARENT_BILLING_SUMMARY_TAB,
    pendingTabKey,
    loadingTabKey,
  );

  return (
    <header
      className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between"
      data-testid="parent-billing-story-header"
    >
      <motion.div
        key={activeTabKey}
        className="min-w-0"
        {...parentBillingViewTransition}
      >
        <ParentSectionKicker theme={theme}>Tuition & payments</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="section" className="!text-[clamp(1.75rem,4vw,2rem)]">
          {title}
        </ParentDisplayHeading>
        <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </motion.div>

      {hasMultipleChildren ? (
        <nav
          className="flex w-full max-w-full shrink-0 gap-1 overflow-x-auto rounded-[11px] p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
          style={{ backgroundColor: "#EAF2EB" }}
          aria-label="Billing sections"
          data-testid="parent-billing-nav"
        >
          <button
            type="button"
            onClick={() => onSelectTab(PARENT_BILLING_SUMMARY_TAB)}
            disabled={summaryTabLoading}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
            style={{
              backgroundColor: isSummaryTab ? theme.white : "transparent",
              color: isSummaryTab ? theme.primary : "#728079",
              boxShadow: isSummaryTab ? "0 1px 4px #dbe2dc" : undefined,
            }}
            aria-current={isSummaryTab ? "true" : undefined}
            aria-busy={summaryTabLoading || undefined}
            data-testid="parent-billing-summary-nav"
          >
            Family view
            {summaryTabLoading ? (
              <Loader2
                className="h-3 w-3 animate-spin"
                data-testid="parent-billing-tab-loading"
              />
            ) : null}
          </button>
          {childViews.map((child) => {
            const active = child.childKey === activeTabKey;
            const firstName = childFirstNameFromFullName(child.studentName);
            const tabLoading = isTabLoading(child.childKey, pendingTabKey, loadingTabKey);
            return (
              <button
                key={child.childKey}
                type="button"
                onClick={() => onSelectTab(child.childKey)}
                disabled={tabLoading}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
                style={{
                  backgroundColor: active ? theme.white : "transparent",
                  color: active ? theme.primary : "#728079",
                  boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
                }}
                aria-current={active ? "true" : undefined}
                aria-busy={tabLoading || undefined}
                data-testid={`parent-billing-child-summary-${child.childKey}`}
              >
                {firstName}
                {tabLoading ? (
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    data-testid="parent-billing-tab-loading"
                  />
                ) : null}
                {!tabLoading && child.status === "needs_schedule" ? (
                  <ParentNeedsScheduleBadge C={C} label="Setup" size="sm" />
                ) : null}
              </button>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
