"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Home,
  Loader2,
  MessageCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CommitteeWorkspaceSidePanel } from "@/components/school-admin/committees/CommitteeWorkspaceStoryHeader";
import CommitteeWorkspaceLayout from "@/components/school-admin/committees/CommitteeWorkspaceLayout";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import ParentCommitteeWorkspaceSkeleton from "@/components/school-parent/committees/ParentCommitteeWorkspaceSkeleton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";

const CommitteeHomeSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeHomeSection"),
  { loading: () => null },
);
const CommitteeResourcesSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeResourcesSection"),
  { loading: () => null },
);
const CommitteeCalendarSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeCalendarSection"),
  { loading: () => null },
);
const CommitteeTasksSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeTasksSection"),
  { loading: () => null },
);
const CommitteeMessagesSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeMessagesSection"),
  { loading: () => null },
);
const CommitteeMembersSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeMembersSection"),
  { loading: () => null },
);

const PARENT_SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, LucideIcon>> = {
  home: Home,
  resources: FileText,
  calendar: CalendarDays,
  tasks: CheckSquare,
  messages: MessageCircle,
  members: Users,
};

const SECTION_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

const PARENT_VISIBLE_SECTIONS: CommitteeWorkspaceSection[] = [
  "home",
  "resources",
  "calendar",
  "tasks",
  "messages",
  "members",
];

function renderSectionContent(
  section: CommitteeWorkspaceSection,
  sectionProps: {
    committee: Committee;
    theme: ParentThemeTokens;
    supabase: SupabaseClient;
    organizationId: string;
    schoolSlug: string;
    onCommitteeChange: (committee: Committee) => void;
    currentMemberId?: string;
    isAdmin: boolean;
    portalApiNamespace: CommitteesApiNamespace;
    activitySurface: "parent" | "teacher";
    canWrite: boolean;
    onNavigate: (section: CommitteeWorkspaceSection) => void;
    composeTokens: AdminThemeTokens;
  },
) {
  const { committee, theme, canWrite, onNavigate, activitySurface, ...rest } = sectionProps;

  switch (section) {
    case "home":
      return (
        <CommitteeHomeSection
          committee={committee}
          theme={theme}
          organizationId={sectionProps.organizationId}
          schoolSlug={sectionProps.schoolSlug}
          activitySurface={activitySurface}
          onNavigate={onNavigate}
        />
      );
    case "resources":
      return <CommitteeResourcesSection {...rest} committee={committee} theme={theme} readOnly={!canWrite} />;
    case "calendar":
      return <CommitteeCalendarSection {...rest} committee={committee} theme={theme} readOnly={!canWrite} />;
    case "tasks":
      return <CommitteeTasksSection {...rest} committee={committee} theme={theme} readOnly={!canWrite} />;
    case "messages":
      return <CommitteeMessagesSection {...rest} committee={committee} theme={theme} readOnly={!canWrite} />;
    case "members":
      return <CommitteeMembersSection {...rest} committee={committee} theme={theme} readOnly />;
    default:
      return null;
  }
}

/**
 * Parent committee workspace — hides Role & Duties and Settings, enables member
 * participation in resources, calendar, tasks, and messages.
 */
export default function ParentCommitteeWorkspaceShell({
  committee,
  theme,
  supabase,
  organizationId,
  schoolSlug,
  activeSection,
  onSectionChange,
  onBack,
  onCommitteeChange,
  currentMemberId,
  previewMode = false,
  backLabel = "My committees",
  portalApiNamespace = "parent-portal",
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  schoolSlug: string;
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  onCommitteeChange: (committee: Committee) => void;
  currentMemberId?: string;
  previewMode?: boolean;
  backLabel?: string;
  portalApiNamespace?: CommitteesApiNamespace;
}) {
  const { adminCompat: composeTokens } = useParentTheme();
  const activitySurface: "parent" | "teacher" =
    portalApiNamespace === "teacher-portal" ? "teacher" : "parent";
  const sections = committee.config.sections.filter(
    (section): section is CommitteeWorkspaceSection =>
      PARENT_VISIBLE_SECTIONS.includes(section as CommitteeWorkspaceSection),
  );
  const canWrite = !previewMode;
  const resolvedSection = sections.includes(activeSection) ? activeSection : "home";
  const [mountedSections, setMountedSections] = useState<Set<CommitteeWorkspaceSection>>(
    () => new Set([resolvedSection]),
  );
  const [pendingSection, setPendingSection] = useState<CommitteeWorkspaceSection | null>(null);

  useEffect(() => {
    setMountedSections((prev) => {
      if (prev.has(resolvedSection)) return prev;
      return new Set(prev).add(resolvedSection);
    });
  }, [resolvedSection]);

  useEffect(() => {
    if (pendingSection === resolvedSection) {
      setPendingSection(null);
    }
  }, [pendingSection, resolvedSection]);

  const handleSectionChange = useCallback(
    (section: CommitteeWorkspaceSection) => {
      if (section !== resolvedSection) {
        setMountedSections((prev) => {
          if (!prev.has(section)) {
            setPendingSection(section);
          }
          return new Set(prev).add(section);
        });
      }
      onSectionChange(section);
    },
    [onSectionChange, resolvedSection],
  );

  const navItems = sections.map((section) => {
    const Icon = PARENT_SECTION_ICONS[section];
    const isPending = pendingSection === section;
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: Icon ? <Icon className={SECTION_ICON_CLASS} /> : undefined,
      testId: `parent-committee-section-${section}`,
      disabled: isPending,
      ariaBusy: isPending,
      suffix: isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" data-testid="parent-committee-tab-loading" />
      ) : undefined,
    };
  });

  const sectionProps = {
    committee,
    theme,
    supabase,
    organizationId,
    schoolSlug,
    onCommitteeChange,
    currentMemberId,
    isAdmin: false,
    portalApiNamespace,
    activitySurface,
    canWrite,
    onNavigate: handleSectionChange,
    composeTokens,
  };

  const visibleMountedSections = PARENT_VISIBLE_SECTIONS.filter(
    (section) => sections.includes(section) && mountedSections.has(section),
  );

  const fillContent = resolvedSection === "messages";

  return (
    <CommitteeWorkspaceLayout
      theme={theme}
      fillContent={fillContent}
      sidePanel={
        <CommitteeWorkspaceSidePanel
          committee={committee}
          theme={theme}
          sections={sections}
          activeSection={resolvedSection}
          onSectionChange={handleSectionChange}
          onBack={onBack}
          backLabel={backLabel}
          variant="parent"
          navItems={navItems}
          navTestId="parent-committee-section-nav"
        />
      }
    >
      {visibleMountedSections.map((section) => {
        const isActive = section === resolvedSection;
        return (
          <div
            key={section}
            hidden={!isActive}
            className={section === "messages" ? "flex h-full min-h-0 flex-1 flex-col" : undefined}
          >
            <Suspense
              fallback={
                pendingSection === section ? (
                  <ParentCommitteeWorkspaceSkeleton
                    theme={theme}
                    variant="section"
                    section={section}
                  />
                ) : null
              }
            >
              {renderSectionContent(section, sectionProps)}
            </Suspense>
          </div>
        );
      })}
    </CommitteeWorkspaceLayout>
  );
}
