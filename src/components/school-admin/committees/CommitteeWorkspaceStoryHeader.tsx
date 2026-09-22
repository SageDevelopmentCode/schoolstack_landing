"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  Home,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import CommitteeWorkspaceSideNav from "@/components/school-admin/committees/CommitteeWorkspaceSideNav";
import CommitteeDescriptionExcerpt from "@/components/school-admin/committees/CommitteeDescriptionExcerpt";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentStoryPillNavItem } from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const SECTION_ICONS: Record<CommitteeWorkspaceSection, LucideIcon> = {
  home: Home,
  about: BookOpen,
  resources: FileText,
  calendar: CalendarDays,
  tasks: CheckSquare,
  messages: MessageCircle,
  members: Users,
  settings: Settings,
};

const SECTION_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

type CommitteeWorkspaceSidePanelProps = {
  committee: Committee;
  theme: ParentThemeTokens;
  sections: CommitteeWorkspaceSection[];
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  backLabel?: string;
  variant?: "admin" | "parent";
  navItems?: ParentStoryPillNavItem[];
  navTestId?: string;
};

export function CommitteeWorkspaceSidePanel({
  committee,
  theme,
  sections,
  activeSection,
  onSectionChange,
  onBack,
  backLabel = "All committees",
  variant = "admin",
  navItems,
  navTestId = "committee-section-nav",
}: CommitteeWorkspaceSidePanelProps) {
  const leaders = committee.members.filter((member) => member.role === "lead");
  const leaderLine =
    leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(", ")}` : null;

  const items =
    navItems ??
    sections.map((section) => {
      const Icon = SECTION_ICONS[section];
      return {
        key: section,
        label: COMMITTEE_SECTION_LABELS[section],
        icon: <Icon className={SECTION_ICON_CLASS} />,
      };
    });

  return (
    <div className="flex flex-col gap-5">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color: theme.muted }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
      ) : null}

      <div className="min-w-0">
        {variant === "admin" ? (
          <>
            <AdminSectionKicker theme={theme}>{committee.termLabel}</AdminSectionKicker>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <AdminDisplayHeading theme={theme} as="h1" size="section">
                {committee.name}
              </AdminDisplayHeading>
              {committee.status === "archived" ? (
                <AdminChip theme={theme} tone="info">
                  Archived
                </AdminChip>
              ) : null}
            </div>
            <CommitteeDescriptionExcerpt
              theme={theme}
              committeeName={committee.name}
              description={committee.description}
              leaderLine={leaderLine}
              className="mt-2"
            />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <ParentDisplayHeading theme={theme} as="h1" size="section">
                {committee.name}
              </ParentDisplayHeading>
              <ParentChip theme={theme} tone="info">
                {committee.termLabel}
              </ParentChip>
              <ParentChip theme={theme} tone="success">
                Member
              </ParentChip>
            </div>
            <CommitteeDescriptionExcerpt
              theme={theme}
              committeeName={committee.name}
              description={committee.description}
              leaderLine={leaderLine}
              className="mt-2"
            />
          </>
        )}
      </div>

      <CommitteeWorkspaceSideNav
        theme={theme}
        items={items}
        activeKey={activeSection}
        onChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
        ariaLabel="Committee sections"
        data-testid={navTestId}
      />
    </div>
  );
}

/** @deprecated Use CommitteeWorkspaceSidePanel inside CommitteeWorkspaceLayout */
export default function CommitteeWorkspaceStoryHeader(props: CommitteeWorkspaceSidePanelProps) {
  return <CommitteeWorkspaceSidePanel {...props} />;
}
