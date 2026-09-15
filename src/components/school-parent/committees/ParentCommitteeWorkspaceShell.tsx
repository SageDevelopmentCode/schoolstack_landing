"use client";

import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  Home,
  MessageCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import { parentCommitteesViewTransition } from "@/components/school-parent/committees/parent-committees-view-transition";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";

const CommitteeHomeSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeHomeSection"),
);
const CommitteeAboutSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeAboutSection"),
);
const CommitteeResourcesSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeResourcesSection"),
);
const CommitteeCalendarSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeCalendarSection"),
);
const CommitteeTasksSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeTasksSection"),
);
const CommitteeMessagesSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeMessagesSection"),
);
const CommitteeMembersSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeMembersSection"),
);

const SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, LucideIcon>> = {
  home: Home,
  about: BookOpen,
  resources: FileText,
  calendar: CalendarDays,
  tasks: CheckSquare,
  messages: MessageCircle,
  members: Users,
};

const SECTION_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

/**
 * Read-only parent workspace shell — omits settings/join-request admin UI and
 * code-splits section panels so the parent committees browse page stays lean.
 */
export default function ParentCommitteeWorkspaceShell({
  committee,
  theme,
  supabase,
  organizationId,
  activeSection,
  onSectionChange,
  onBack,
  onCommitteeChange,
  backLabel = "My committees",
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  onCommitteeChange: (committee: Committee) => void;
  backLabel?: string;
}) {
  const sections = committee.config.sections.filter(
    (section): section is CommitteeWorkspaceSection => section !== "settings",
  );
  const leaders = committee.members.filter((m) => m.role === "lead");

  const navItems = sections.map((section) => {
    const Icon = SECTION_ICONS[section];
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: Icon ? <Icon className={SECTION_ICON_CLASS} /> : undefined,
      testId: `parent-committee-section-${section}`,
    };
  });

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: theme.paper }}>
      <div
        className="shrink-0 border-b px-4 py-4 sm:px-6 md:px-9"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        <div className="mx-auto max-w-[1250px]">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ color: theme.muted }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </button>
          ) : null}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ParentDisplayHeading theme={theme} as="h1" size="section">
                {committee.name}
              </ParentDisplayHeading>
              <ParentChip theme={theme} tone="info">
                {committee.termLabel}
              </ParentChip>
            </div>
            <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
              {committee.description}
            </p>
            {leaders.length > 0 ? (
              <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>
                Led by {leaders.map((l) => l.name).join(", ")}
              </p>
            ) : null}
          </div>
          <div className="mt-4">
            <ParentStoryPillNav
              theme={theme}
              items={navItems}
              activeKey={activeSection}
              onChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
              ariaLabel="Committee sections"
              data-testid="parent-committee-section-nav"
            />
          </div>
        </div>
      </div>

      <div
        className={
          activeSection === "messages"
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-9"
        }
        style={{ backgroundColor: theme.paper }}
      >
        <div className={activeSection === "messages" ? "flex min-h-0 flex-1 flex-col" : "mx-auto max-w-[1250px] w-full"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              {...parentCommitteesViewTransition}
              className={
                activeSection === "messages"
                  ? "flex h-full min-h-0 flex-1 flex-col"
                  : undefined
              }
            >
              {activeSection === "home" ? (
                <CommitteeHomeSection
                  committee={committee}
                  theme={theme}
                  onNavigate={onSectionChange}
                />
              ) : null}
              {activeSection === "about" ? (
                <CommitteeAboutSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
              {activeSection === "resources" ? (
                <CommitteeResourcesSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
              {activeSection === "calendar" ? (
                <CommitteeCalendarSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
              {activeSection === "tasks" ? (
                <CommitteeTasksSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
              {activeSection === "messages" ? (
                <CommitteeMessagesSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
              {activeSection === "members" ? (
                <CommitteeMembersSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
