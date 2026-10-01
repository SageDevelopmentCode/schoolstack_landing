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
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import { committeesApiBaseForPortal } from "@/lib/committees/committees-api-base";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { CommitteeSectionUnreadCounts } from "@/lib/committees/committee-unread-types";
import { useCommitteeUnreadRefresh } from "@/lib/committees/committee-unread-refresh-context";
import { useCommitteeUnreadSummary } from "@/lib/committees/use-committee-unread-summary";
import { markCommitteeSectionReadViaApi } from "@/lib/committees/mark-committee-section-read-client";

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
    committeesApiBase: string;
    messagesApiBase: string;
    activitySurface: "parent" | "teacher";
    canWrite: boolean;
    onNavigate: (section: CommitteeWorkspaceSection) => void;
    composeTokens: AdminThemeTokens;
    initialActivityItems?: CommitteeActivityItem[];
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
  initialActivityItems,
  initialSectionUnread,
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
  initialActivityItems?: CommitteeActivityItem[];
  initialSectionUnread?: CommitteeSectionUnreadCounts;
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

  const navItems = sections.map((section) => {
    const Icon = PARENT_SECTION_ICONS[section];
    const isPending = pendingSection === section;
    const unreadCount = unreadCountForSection(section);
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: Icon ? <Icon className={SECTION_ICON_CLASS} /> : undefined,
      testId: `parent-committee-section-${section}`,
      disabled: isPending,
      ariaBusy: isPending,
      suffix: isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" data-testid="parent-committee-tab-loading" />
      ) : unreadCount > 0 ? (
        <MessagesNavBadge
          count={unreadCount}
          theme={{
            accent: composeTokens.accent,
            accentLight: composeTokens.accentLight,
          }}
        />
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
    committeesApiBase,
    messagesApiBase: committeesApiBase,
    activitySurface,
    canWrite,
    onNavigate: handleSectionChange,
    composeTokens,
    initialActivityItems,
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
