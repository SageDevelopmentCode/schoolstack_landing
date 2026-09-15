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
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
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

type CommitteeWorkspaceStoryHeaderProps = {
  committee: Committee;
  theme: ParentThemeTokens;
  sections: CommitteeWorkspaceSection[];
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  backLabel?: string;
};

export default function CommitteeWorkspaceStoryHeader({
  committee,
  theme,
  sections,
  activeSection,
  onSectionChange,
  onBack,
  backLabel = "All committees",
}: CommitteeWorkspaceStoryHeaderProps) {
  const leaders = committee.members.filter((member) => member.role === "lead");

  const pillItems = sections.map((section) => {
    const Icon = SECTION_ICONS[section];
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: <Icon className="h-3.5 w-3.5" />,
    };
  });

  const leaderLine =
    leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(", ")}` : null;

  return (
    <div className="mb-5 flex flex-col gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium"
          style={{ color: theme.muted }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
      ) : null}

      <div className="min-w-0">
        <AdminSectionKicker theme={theme}>{committee.termLabel}</AdminSectionKicker>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <AdminDisplayHeading theme={theme} as="h1" size="section">
            {committee.name}
          </AdminDisplayHeading>
          {committee.status === "archived" ? (
            <AdminChip theme={theme} tone="info">Archived</AdminChip>
          ) : null}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: theme.muted }}>
          {committee.description}
          {leaderLine ? (
            <>
              <br />
              <span className="text-xs">{leaderLine}</span>
            </>
          ) : null}
        </p>
      </div>

      <ParentStoryPillNav
        theme={theme}
        items={pillItems}
        activeKey={activeSection}
        onChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
        ariaLabel="Committee sections"
        data-testid="committee-section-nav"
      />
    </div>
  );
}
