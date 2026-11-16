"use client";

import { useMemo, type ReactNode } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GChip, GTabBar } from "@/components/school-parent/garden/ui";
import {
  PARENT_BILLING_AGREEMENTS_TAB,
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
  refreshing?: boolean;
  childViews: ParentBillingChildView[];
  openChargeCount: number;
  totalRemainingCents: number;
  hasAgreements: boolean;
  pendingAgreementCount: number;
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

/**
 * Billing page header (Garden): kicker → h1 → subtitle, with the billing
 * section tabs (Family view / each child / Forms) on the right.
 */
export default function ParentBillingStoryHeader({
  C,
  activeTabKey,
  pendingTabKey = null,
  loadingTabKey = null,
  refreshing = false,
  childViews,
  openChargeCount,
  totalRemainingCents,
  hasAgreements,
  pendingAgreementCount,
  onSelectTab,
}: ParentBillingStoryHeaderProps) {
  const hasMultipleChildren = childViews.length > 1;
  const isAgreementsTab = activeTabKey === PARENT_BILLING_AGREEMENTS_TAB;
  const isSummaryTab = activeTabKey === PARENT_BILLING_SUMMARY_TAB;
  const activeChild = childViews.find((child) => child.childKey === activeTabKey);

  const title: ReactNode = isAgreementsTab ? (
    <>
      Forms &amp; <span className="text-[var(--sf-clay)]">agreements</span>
    </>
  ) : isSummaryTab || !activeChild ? (
    <>
      Family <span className="text-[var(--sf-clay)]">tuition</span>
    </>
  ) : (
    <>
      <span className="text-[var(--sf-clay)]">
        {childFirstNameFromFullName(activeChild.studentName)}&apos;s
      </span>{" "}
      tuition
    </>
  );

  const subtitle = resolveSubtitle(openChargeCount, totalRemainingCents);
  const summaryTabLoading = isTabLoading(
    PARENT_BILLING_SUMMARY_TAB,
    pendingTabKey,
    loadingTabKey,
  );

  const navItems = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      disabled: boolean;
      ariaBusy: boolean;
      testId: string;
      suffix?: ReactNode;
    }> = [];

    if (hasMultipleChildren) {
      items.push({
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
      });
    }

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

    if (hasAgreements) {
      const agreementsTabLoading = isTabLoading(
        PARENT_BILLING_AGREEMENTS_TAB,
        pendingTabKey,
        loadingTabKey,
      );
      items.push({
        key: PARENT_BILLING_AGREEMENTS_TAB,
        label: "Forms",
        disabled: agreementsTabLoading,
        ariaBusy: agreementsTabLoading,
        testId: "parent-billing-agreements-nav",
        suffix: agreementsTabLoading ? (
          <Loader2
            className="h-3 w-3 animate-spin"
            data-testid="parent-billing-tab-loading"
          />
        ) : pendingAgreementCount > 0 ? (
          <span
            className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--sf-butter)] px-1 text-[10px] font-extrabold text-[#6b4f00]"
            aria-label={`${pendingAgreementCount} agreement${pendingAgreementCount === 1 ? "" : "s"} need your signature`}
            title="Signature needed"
          >
            <CircleAlert className="h-3 w-3" aria-hidden />
          </span>
        ) : undefined,
      });
    }

    return items;
  }, [
    C,
    childViews,
    hasAgreements,
    hasMultipleChildren,
    loadingTabKey,
    pendingAgreementCount,
    pendingTabKey,
    summaryTabLoading,
  ]);

  return (
    <div data-testid="parent-billing-story-header">
      <ParentGardenPageHeader
        kicker="Tuition & payments"
        title={title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span>{subtitle}</span>
            {refreshing ? (
              <GChip tone="neutral" className="!font-bold">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                <span role="status">Updating…</span>
              </GChip>
            ) : null}
          </span>
        }
        actions={
          hasMultipleChildren || hasAgreements ? (
            <GTabBar
              items={navItems}
              activeKey={activeTabKey}
              onChange={onSelectTab}
              ariaLabel="Billing sections"
              data-testid="parent-billing-nav"
            />
          ) : null
        }
      />
    </div>
  );
}
