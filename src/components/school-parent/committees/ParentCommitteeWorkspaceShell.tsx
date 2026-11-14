"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SupabaseClient } from "@supabase/supabase-js";
import GardenCommitteeWorkspaceLayout from "@/components/school-parent/committees/garden/GardenCommitteeWorkspaceLayout";
import type { GardenCommitteeNavItem } from "@/components/school-parent/committees/garden/GardenCommitteeSectionNav";
import { COMMITTEE_SECTION_ICONS } from "@/components/school-parent/committees/garden/committee-garden-shared";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import {
  CommitteeSurfaceProvider,
  gardenCommitteeTheme,
} from "@/components/school-admin/committees/committee-surface";
import ParentCommitteeWorkspaceSkeleton from "@/components/school-parent/committees/ParentCommitteeWorkspaceSkeleton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import { committeesApiBaseForPortal } from "@/lib/committees/committees-api-base";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { CommitteeSectionUnreadCounts } from "@/lib/committees/committee-unread-types";
import { useCommitteeUnreadRefresh } from "@/lib/committees/committee-unread-refresh-context";
import { useCommitteeUnreadSummary } from "@/lib/committees/use-committee-unread-summary";
import { markCommitteeSectionReadViaApi } from "@/lib/committees/mark-committee-section-read-client";

function CommitteeSectionLoading({ section }: { section: CommitteeWorkspaceSection }) {
  const { theme } = useParentTheme();
  return (
    <ParentCommitteeWorkspaceSkeleton theme={theme} variant="section" section={section} />
  );
}

const CommitteeHomeSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeHomeSection"),
  { loading: () => null },
);
const CommitteeResourcesSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeResourcesSection"),
  { loading: () => <CommitteeSectionLoading section="resources" /> },
);
const CommitteeCalendarSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeCalendarSection"),
  { loading: () => <CommitteeSectionLoading section="calendar" /> },
);
const CommitteeTasksSection = dynamic(
  () => import("@/components/school-admin/committees/sections/CommitteeTasksSection"),
  { loading: () => <CommitteeSectionLoading section="tasks" /> },
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
const CommitteeProjectsSection = dynamic(
  () =>
    import("@/components/school-admin/committees/sections/CommitteeProjectsSection"),
  { loading: () => <CommitteeSectionLoading section="projects" /> },
);

const PARENT_VISIBLE_SECTIONS: CommitteeWorkspaceSection[] = [
  "home",
  "resources",
  "calendar",
  "tasks",
  "projects",
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
    committeesApiBase: string;
    messagesApiBase: string;
    activitySurface: "parent" | "teacher";
    canWrite: boolean;
    onNavigate: (section: CommitteeWorkspaceSection) => void;
    composeTokens: AdminThemeTokens;
    initialActivityItems?: CommitteeActivityItem[];
    initialCommitteeEventId?: string | null;
    initialCommitteeEventDate?: string | null;
    initialCommitteeResourceId?: string | null;
    initialCommitteeTaskId?: string | null;
    initialCommitteeProjectId?: string | null;
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
          initialActivityItems={sectionProps.initialActivityItems}
          onNavigate={onNavigate}
        />
      );
    case "resources":
      return (
        <CommitteeResourcesSection
          {...rest}
          committee={committee}
          theme={theme}
          readOnly={!canWrite}
          initialResourceId={sectionProps.initialCommitteeResourceId}
        />
      );
    case "calendar":
      return (
        <CommitteeCalendarSection
          {...rest}
          committee={committee}
          theme={theme}
          readOnly={!canWrite}
          initialEventId={sectionProps.initialCommitteeEventId}
          initialEventDate={sectionProps.initialCommitteeEventDate}
        />
      );
    case "tasks":
      return (
        <CommitteeTasksSection
          {...rest}
          committee={committee}
          theme={theme}
          readOnly={!canWrite}
          initialTaskId={sectionProps.initialCommitteeTaskId}
        />
      );
    case "messages":
      return <CommitteeMessagesSection {...rest} committee={committee} theme={theme} readOnly={!canWrite} />;
    case "members":
      return <CommitteeMembersSection {...rest} committee={committee} theme={theme} readOnly />;
    case "projects":
      return (
        <CommitteeProjectsSection
          committee={committee}
          theme={theme}
          supabase={sectionProps.supabase}
          organizationId={sectionProps.organizationId}
          readOnly={!canWrite}
          currentMemberId={sectionProps.currentMemberId}
          portalApiNamespace={sectionProps.portalApiNamespace}
          initialProjectId={sectionProps.initialCommitteeProjectId}
        />
      );
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
  initialActivityItems,
  initialSectionUnread,
  backLabel = "My committees",
  portalApiNamespace = "parent-portal",
  initialCommitteeEventId,
  initialCommitteeEventDate,
  initialCommitteeResourceId,
  initialCommitteeTaskId,
  initialCommitteeProjectId,
  workspaceDataReady = true,
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
  initialActivityItems?: CommitteeActivityItem[];
  initialSectionUnread?: CommitteeSectionUnreadCounts;
  backLabel?: string;
  portalApiNamespace?: CommitteesApiNamespace;
  initialCommitteeEventId?: string | null;
  initialCommitteeEventDate?: string | null;
  initialCommitteeResourceId?: string | null;
  initialCommitteeTaskId?: string | null;
  initialCommitteeProjectId?: string | null;
  workspaceDataReady?: boolean;
}) {
  const { adminCompat: composeTokens } = useParentTheme();
  const activitySurface: "parent" | "teacher" =
    portalApiNamespace === "teacher-portal" ? "teacher" : "parent";
  const sections = (
    [...committee.config.sections, "projects"] as CommitteeWorkspaceSection[]
  ).filter(
    (section, index, arr) =>
      PARENT_VISIBLE_SECTIONS.includes(section) && arr.indexOf(section) === index,
  );
  const canWrite = !previewMode;
  const resolvedSection = sections.includes(activeSection) ? activeSection : "home";
  const [mountedSections, setMountedSections] = useState<Set<CommitteeWorkspaceSection>>(
    () => new Set([resolvedSection]),
  );
  const [pendingSection, setPendingSection] = useState<CommitteeWorkspaceSection | null>(null);
  const committeesApiBase = committeesApiBaseForPortal(portalApiNamespace);
  const committeeUnreadRefresh = useCommitteeUnreadRefresh();
  const { summary: liveUnreadSummary } = useCommitteeUnreadSummary(
    committeesApiBase,
    organizationId,
    !previewMode,
  );
  const sectionUnreadCounts: CommitteeSectionUnreadCounts | undefined =
    previewMode && initialSectionUnread
      ? initialSectionUnread
      : liveUnreadSummary.byCommittee.find((row) => row.committeeId === committee.id)
          ?.sections;

  const unreadCountForSection = (section: CommitteeWorkspaceSection): number => {
    if (!sectionUnreadCounts) return 0;
    if (section === "messages") return sectionUnreadCounts.messages;
    if (section === "tasks") return sectionUnreadCounts.tasks;
    if (section === "resources") return sectionUnreadCounts.resources;
    if (section === "calendar") return sectionUnreadCounts.calendar;
    return 0;
  };

  useEffect(() => {
    queueMicrotask(() => {
      setMountedSections((prev) => {
        if (prev.has(resolvedSection)) return prev;
        return new Set(prev).add(resolvedSection);
      });
    });
  }, [resolvedSection]);

  useEffect(() => {
    if (pendingSection === resolvedSection) {
      queueMicrotask(() => {
        setPendingSection(null);
      });
    }
  }, [pendingSection, resolvedSection]);

  useEffect(() => {
    if (!currentMemberId || previewMode) return;
    const section = resolvedSection;
    if (
      section !== "messages" &&
      section !== "tasks" &&
      section !== "resources" &&
      section !== "calendar"
    ) {
      return;
    }
    if (section === "messages" && !workspaceDataReady) {
      return;
    }
    void markCommitteeSectionReadViaApi(committeesApiBase, committee.id, {
      organizationId,
      section: section as CommitteeWorkspaceSection,
    })
      .then(() => {
        committeeUnreadRefresh?.notifyCommitteeUnreadChanged();
      })
      .catch(() => undefined);
  }, [
    committeesApiBase,
    committee.id,
    committeeUnreadRefresh,
    currentMemberId,
    organizationId,
    previewMode,
    resolvedSection,
    workspaceDataReady,
  ]);

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

  const navItems: GardenCommitteeNavItem[] = sections.map((section) => {
    const Icon = COMMITTEE_SECTION_ICONS[section];
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: Icon ? <Icon /> : undefined,
      testId: `parent-committee-section-${section}`,
      pending: pendingSection === section,
      unreadCount: unreadCountForSection(section),
      isNew: section === "projects",
    };
  });

  // Sections render on the Garden surface: Garden neutrals + fonts, school accent.
  const sectionTheme = useMemo(() => gardenCommitteeTheme(theme), [theme]);

  const sectionProps = {
    committee,
    theme: sectionTheme,
    supabase,
    organizationId,
    schoolSlug,
    onCommitteeChange,
    currentMemberId,
    isAdmin: false,
    portalApiNamespace,
    committeesApiBase,
    messagesApiBase: committeesApiBase,
    activitySurface,
    canWrite,
    onNavigate: handleSectionChange,
    composeTokens,
    initialActivityItems,
    initialCommitteeEventId,
    initialCommitteeEventDate,
    initialCommitteeResourceId,
    initialCommitteeTaskId,
    initialCommitteeProjectId,
  };

  const visibleMountedSections = PARENT_VISIBLE_SECTIONS.filter(
    (section) => sections.includes(section) && mountedSections.has(section),
  );

  const fillContent = resolvedSection === "messages";

  return (
    <GardenCommitteeWorkspaceLayout
      theme={theme}
      committee={committee}
      navItems={navItems}
      activeSection={resolvedSection}
      activeSectionLabel={COMMITTEE_SECTION_LABELS[resolvedSection]}
      onSectionChange={(key) => handleSectionChange(key as CommitteeWorkspaceSection)}
      onBack={onBack}
      backLabel={backLabel}
      navTestId="parent-committee-section-nav"
      fillContent={fillContent}
    >
      <CommitteeSurfaceProvider value="garden">
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
      </CommitteeSurfaceProvider>
    </GardenCommitteeWorkspaceLayout>
  );
}
