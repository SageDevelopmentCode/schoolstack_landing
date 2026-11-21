"use client";

import { useCallback, useMemo } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenNav from "@/components/school-parent/header/ParentGardenNav";
import type { ParentNavItem } from "@/lib/organization-settings/parent-nav";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/*
 * Garden portal header for the marketing demos (parent + teacher), modelled on
 * `SchoolParentHeader`: the MudKitchen logo, the real `ParentGardenNav`
 * (embedded variant, so it never hides on small viewports) and an initials
 * avatar. (No school wordmark: demo logos are reverse/white artwork that
 * vanishes on the cream header.) Nav hrefs are virtual (`demo:<tab>`) and only switch the demo tab.
 *
 * The More menu is `GardenHeaderPopover`, anchored under the More trigger with
 * `position: absolute`, so it scales with `DemoStage`'s transformed canvas.
 *
 * Skill: `.claude/skills/parent-portal-garden-design` › Header / nav.
 */

export type DemoPortalNavEntry<Tab extends string> = {
  label: string;
  icon: LucideIcon;
  tab: Tab;
  /** Key into `parent-feature-icon-styles` for the inactive icon colour. */
  iconSlug: string;
};

const HREF_PREFIX = "demo:";

function toNavItems<Tab extends string>(entries: DemoPortalNavEntry<Tab>[]): ParentNavItem[] {
  return entries.map(({ label, icon, tab, iconSlug }) => ({
    key: tab,
    name: label,
    icon,
    iconSlug,
    href: `${HREF_PREFIX}${tab}`,
  }));
}

export default function DemoPortalGardenHeader<Tab extends string>({
  theme,
  primary,
  more,
  activeTab,
  onTabChange,
  initials,
  personName,
  ariaLabel,
  testIdPrefix,
  messagesUnreadCount = 0,
}: {
  theme: ParentThemeTokens;
  primary: DemoPortalNavEntry<Tab>[];
  more: DemoPortalNavEntry<Tab>[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  initials: string;
  personName: string;
  ariaLabel: string;
  testIdPrefix: string;
  messagesUnreadCount?: number;
}) {
  const primaryItems = useMemo(() => toNavItems(primary), [primary]);
  const moreItems = useMemo(() => toNavItems(more), [more]);
  const tabs = useMemo(
    () => new Set<string>([...primary, ...more].map((entry) => entry.tab)),
    [primary, more],
  );

  const handleNavigate = useCallback(
    (href: string) => {
      const tab = href.startsWith(HREF_PREFIX) ? href.slice(HREF_PREFIX.length) : "";
      if (tabs.has(tab)) onTabChange(tab as Tab);
    },
    [onTabChange, tabs],
  );

  return (
    <ParentGardenScope
      as="header"
      theme={theme}
      className="relative z-40 shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 !bg-[var(--sf-paper)]"
    >
      {/* On a phone (the demo runs on a phone-width canvas) the nav drops to its own
          full-width second row, like the real portal's `variant="mobile"` row. */}
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-6 max-sm:min-h-0 max-sm:flex-wrap max-sm:gap-y-0 max-sm:px-4 max-sm:pt-2.5">
        <Image
          src="/images/schoolstack-logo.png"
          alt="MudKitchen"
          width={40}
          height={40}
          className="h-9 w-auto shrink-0 object-contain"
        />

        <div
          data-tour-nav="primary"
          className="flex min-w-0 flex-1 justify-center max-sm:order-last max-sm:-mx-4 max-sm:mt-2.5 max-sm:basis-full max-sm:justify-start max-sm:border-t-[1.5px] max-sm:border-[var(--sf-ink)]/[0.07] max-sm:px-3 max-sm:py-2"
        >
          <ParentGardenNav
            variant="embedded"
            primary={primaryItems}
            more={moreItems}
            pathname={`${HREF_PREFIX}${activeTab}`}
            theme={theme}
            messagesUnreadCount={messagesUnreadCount}
            committeesUnreadCount={0}
            onNavigate={handleNavigate}
            ariaLabel={ariaLabel}
            testIdPrefix={testIdPrefix}
          />
        </div>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sf-clay)] text-[12px] font-extrabold text-white ring-[1.5px] ring-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)]"
          role="img"
          aria-label={personName}
        >
          {initials}
        </span>
      </div>
    </ParentGardenScope>
  );
}
