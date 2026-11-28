"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GKicker, GTabBar, type GTabBarItem } from "@/components/school-parent/garden/ui";
import { gFade } from "@/components/school-parent/garden/motion";
import { AdminGardenPageHeader, GardenRefreshControl } from "@/components/school-admin/garden/kit";

/*
 * Header for every /admin/marketing tab: kicker, h1 with one clay accent
 * word, a status line built from data, actions and the Marketing tab bar.
 * Rules: `.claude/skills/admin-portal-garden-design` §3.
 */

// No counts on the tabs: they'd pull every carousel and brand mark into each tab's bundle.
const MARKETING_TABS = [
  { key: "/admin/marketing", label: "Carousels", exact: true },
  { key: "/admin/marketing/schedule", label: "Schedule", exact: false },
  { key: "/admin/marketing/avatars", label: "Avatars & icons", exact: false },
  { key: "/admin/marketing/blog", label: "Blog", exact: true },
  { key: "/admin/marketing/blog-topics", label: "Blog topics", exact: false },
] as const;

function activeTab(pathname: string): string {
  const match = MARKETING_TABS.find((tab) =>
    tab.exact ? pathname === tab.key : pathname === tab.key || pathname.startsWith(`${tab.key}/`),
  );
  return match?.key ?? "";
}

/** The Marketing tabs as a Garden tab bar; each tab is its own route. */
export function useMarketingTabs() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  useEffect(() => {
    for (const tab of MARKETING_TABS) router.prefetch(tab.key);
  }, [router]);
  const items: GTabBarItem[] = MARKETING_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
    testId: `marketing-tab-${tab.label.toLowerCase().replace(/[^a-z]+/g, "-")}`,
  }));
  return {
    items,
    activeKey: activeTab(pathname),
    onChange: (key: string) => router.push(key),
    ariaLabel: "Marketing sections",
    "data-testid": "marketing-tabs",
  };
}

function subscribeNever() {
  return () => {};
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** "MudKitchen marketing · Friday, November 27" (date from `sm` up, client only). */
export function MarketingKicker() {
  const today = useSyncExternalStore(subscribeNever, todayLabel, () => null);
  return (
    <>
      MudKitchen marketing
      {today ? <span className="hidden sm:inline"> · {today}</span> : null}
    </>
  );
}

type RefreshProps = { onRefresh: () => void; refreshing: boolean; lastUpdatedAt: number; label: string };

export function MarketingGardenHeader({
  title,
  subtitle,
  actions,
  refresh,
  kicker,
  compact = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  refresh?: RefreshProps;
  kicker?: ReactNode;
  /** Studios: one row (title left, tabs right) so the canvas stays big. */
  compact?: boolean;
}) {
  const tabs = useMarketingTabs();
  const reduce = useReducedMotion() === true;
  if (!compact) {
    return (
      <AdminGardenPageHeader
        kicker={kicker ?? <MarketingKicker />}
        title={title}
        subtitle={subtitle}
        actions={actions}
        refresh={refresh}
        tabs={tabs}
        data-testid="marketing-header"
      />
    );
  }
  return (
    <motion.header
      {...gFade(0, reduce)}
      data-testid="marketing-header"
      className="flex shrink-0 flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"
    >
      <div className="min-w-0">
        <GKicker className="mb-1.5">{kicker ?? <MarketingKicker />}</GKicker>
        <h1 className="sf-display m-0 truncate text-[1.6rem] leading-[1.05] text-[var(--sf-ink)] sm:text-[1.85rem]">{title}</h1>
        {subtitle ? (
          <p className="m-0 mt-1.5 truncate text-[13.5px] font-semibold text-[var(--sf-soft)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {refresh ? <GardenRefreshControl {...refresh} /> : null}
        {actions}
        <GTabBar
          items={tabs.items}
          activeKey={tabs.activeKey}
          onChange={tabs.onChange}
          ariaLabel={tabs.ariaLabel}
          data-testid={tabs["data-testid"]}
        />
      </div>
    </motion.header>
  );
}

/**
 * "Website blog" → "Website <clay>blog</clay>": colours the last word of a
 * title. A trailing count like "(6)" stays plain: "Ads: Crew <clay>voice</clay> (6)".
 */
export function AccentLast({ text, className = "text-[var(--sf-clay)]" }: { text: string; className?: string }) {
  const match = text.trim().match(/^(.*?)(\S+)(\s+\([^)]*\))?$/);
  if (!match) return <>{text}</>;
  const [, lead, word, tail = ""] = match;
  return (
    <>
      {lead}
      <span className={className}>{word}</span>
      {tail}
    </>
  );
}
