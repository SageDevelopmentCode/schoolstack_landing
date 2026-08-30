"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import { parentBillingViewTransition } from "@/components/school-parent/billing/parent-billing-view-transition";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
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

  const navItems = useMemo(() => {
    const items = [
      {
        key: PARENT_BILLING_SUMMARY_TAB,
        label: "Family view",
        disabled: summaryTabLoading,
        ariaBusy: summaryTabLoading,
        testId: "parent-billing-summary-nav",
        suffix: summaryTabLoading ? (
          <Loader2
            className="h-3 w-3 animate-spin"
            data-testid="parent-billing-tab-loading"
          />
        ) : undefined,
      },
    ];

    for (const child of childViews) {
      const tabLoading = isTabLoading(child.childKey, pendingTabKey, loadingTabKey);
      items.push({
        key: child.childKey,
        label: childFirstNameFromFullName(child.studentName),
        disabled: tabLoading,
        ariaBusy: tabLoading,
        testId: `parent-billing-child-summary-${child.childKey}`,
        suffix: tabLoading ? (
          <Loader2
            className="h-3 w-3 animate-spin"
            data-testid="parent-billing-tab-loading"
          />
        ) : !tabLoading && child.status === "needs_schedule" ? (
          <ParentNeedsScheduleBadge C={C} label="Setup" size="sm" />
        ) : undefined,
      });
    }

    return items;
  }, [C, childViews, loadingTabKey, pendingTabKey, summaryTabLoading]);

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
        <ParentStoryPillNav
          theme={theme}
          items={navItems}
          activeKey={activeTabKey}
          onChange={onSelectTab}
          ariaLabel="Billing sections"
          data-testid="parent-billing-nav"
        />
      ) : null}
    </header>
  );
}
