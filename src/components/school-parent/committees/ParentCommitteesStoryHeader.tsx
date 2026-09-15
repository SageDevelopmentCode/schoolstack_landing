"use client";

import { motion } from "framer-motion";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import { parentCommitteesViewTransition } from "@/components/school-parent/committees/parent-committees-view-transition";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentCommitteesTab = "explore" | "mine";

type ParentCommitteesStoryHeaderProps = {
  theme: ParentThemeTokens;
  activeTab: ParentCommitteesTab;
  exploreCount: number;
  myCount: number;
  onSelectTab: (tab: ParentCommitteesTab) => void;
};

function resolveTitle(activeTab: ParentCommitteesTab): string {
  return activeTab === "explore" ? "Explore committees" : "Your committees";
}

function resolveSubtitle(
  activeTab: ParentCommitteesTab,
  exploreCount: number,
  myCount: number,
): string {
  if (activeTab === "explore") {
    if (exploreCount === 0) {
      return "No volunteer committees are open right now.";
    }
    const label = exploreCount === 1 ? "1 committee" : `${exploreCount} committees`;
    return `${label} open for volunteers`;
  }

  if (myCount === 0) {
    return "Approved committee workspaces will appear here.";
  }
  const label = myCount === 1 ? "1 active workspace" : `${myCount} active workspaces`;
  return label;
}

export default function ParentCommitteesStoryHeader({
  theme,
  activeTab,
  exploreCount,
  myCount,
  onSelectTab,
}: ParentCommitteesStoryHeaderProps) {
  const title = resolveTitle(activeTab);
  const subtitle = resolveSubtitle(activeTab, exploreCount, myCount);

  const navItems = [
    {
      key: "explore",
      label: "Explore",
      testId: "parent-committees-explore-nav",
    },
    {
      key: "mine",
      label: "My committees",
      testId: "parent-committees-mine-nav",
    },
  ];

  return (
    <header
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      data-testid="parent-committees-story-header"
    >
      <motion.div key={activeTab} className="min-w-0" {...parentCommitteesViewTransition}>
        <ParentSectionKicker theme={theme}>Volunteer & committees</ParentSectionKicker>
        <ParentDisplayHeading
          theme={theme}
          as="h1"
          size="section"
          className="!text-[clamp(1.75rem,4vw,2rem)]"
        >
          {title}
        </ParentDisplayHeading>
        <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </motion.div>

      <ParentStoryPillNav
        theme={theme}
        items={navItems}
        activeKey={activeTab}
        onChange={(key) => onSelectTab(key as ParentCommitteesTab)}
        ariaLabel="Committee sections"
        data-testid="parent-committees-nav"
      />
    </header>
  );
}
