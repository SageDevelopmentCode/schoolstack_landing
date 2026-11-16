"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Activity, BookOpen, Settings } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { getCommittee } from "@/lib/committees/committees";
import { GChip } from "@/components/school-parent/garden/ui";
import GardenCommitteeWorkspaceLayout from "@/components/school-parent/committees/garden/GardenCommitteeWorkspaceLayout";
import type { GardenCommitteeNavItem } from "@/components/school-parent/committees/garden/GardenCommitteeSectionNav";
import { COMMITTEE_SECTION_ICONS } from "@/components/school-parent/committees/garden/committee-garden-shared";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import CommitteeHomeSection from "./sections/CommitteeHomeSection";
import CommitteeAboutSection from "./sections/CommitteeAboutSection";
import CommitteeResourcesSection from "./sections/CommitteeResourcesSection";
import CommitteeCalendarSection from "./sections/CommitteeCalendarSection";
import CommitteeTasksSection from "./sections/CommitteeTasksSection";
import CommitteeMessagesSection from "./sections/CommitteeMessagesSection";
import CommitteeMembersSection from "./sections/CommitteeMembersSection";
import CommitteeSettingsSection from "./sections/CommitteeSettingsSection";
import CommitteeActivitySection from "./sections/CommitteeActivitySection";
import CommitteeProjectsSection from "./sections/CommitteeProjectsSection";
import CommitteeJoinRequestsPanel from "./CommitteeJoinRequestsPanel";
import CommitteeWorkspaceSectionFrame from "./CommitteeWorkspaceSectionFrame";
import { CommitteeSurfaceProvider, gardenCommitteeTheme } from "./committee-surface";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";

const ADMIN_SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, typeof Activity>> = {
  ...COMMITTEE_SECTION_ICONS,
  about: BookOpen,
  activity: Activity,
  settings: Settings,
};

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatEventDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Admin committee workspace in Garden: the shared Garden workspace layout
 * (rail with back link, committee, section nav; compact bar + menu sheet on
 * phones) with the admin sections. Sections render their Garden look via the
 * "admin-garden" surface and admin toasts; the admin skin restyles the
 * admin-only editors (Role & Duties, Settings).
 */
export default function CommitteeWorkspaceShell({
  committee,
  theme,
  supabase,
  organizationId,
  activeSection,
  onSectionChange,
  onBack,
  onCommitteeChange,
  onArchive,
  readOnly = false,
  backLabel = "All committees",
  schoolSlug,
  onJoinRequestsChanged,
  composeTokens,
  initialProjectId,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  composeTokens?: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  onCommitteeChange: (committee: Committee) => void;
  onArchive?: () => void;
  readOnly?: boolean;
  backLabel?: string;
  schoolSlug?: string;
  onJoinRequestsChanged?: () => void;
  initialProjectId?: string | null;
}) {
  const reduce = useReducedMotion() === true;
  const { C: shellComposeTokens } = useSchoolAdminStoryTheme();
  const resolvedComposeTokens = composeTokens ?? shellComposeTokens;
  const sectionTheme = useMemo(() => gardenCommitteeTheme(theme), [theme]);
  const sections = (readOnly
    ? committee.config.sections
    : [...committee.config.sections, "projects", "activity", "settings"]
  ).filter((section, index, arr) => arr.indexOf(section) === index) as CommitteeWorkspaceSection[];
  const resolvedSection = sections.includes(activeSection) ? activeSection : "home";
  const fillContent = resolvedSection === "messages";

  // Stable identity: the join-requests panel refetches when this changes.
  const committeeDutyRoles = useMemo(
    () =>
      committee.dutyRoles.map((dutyRole) => ({
        id: dutyRole.id,
        title: dutyRole.title,
        assigneeId: dutyRole.assigneeId,
        assigneeName: committee.members.find((member) => member.id === dutyRole.assigneeId)?.name,
      })),
    [committee.dutyRoles, committee.members],
  );

  const statusLine = useMemo(() => {
    const openTasks = committee.tasks.filter((task) => task.status !== "done").length;
    const today = todayIso();
    const nextEvent = [...committee.events]
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return [
      `${committee.members.length} member${committee.members.length === 1 ? "" : "s"}`,
      `${openTasks} open task${openTasks === 1 ? "" : "s"}`,
      nextEvent ? `Next: ${nextEvent.title}, ${formatEventDate(nextEvent.date)}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [committee.events, committee.members.length, committee.tasks]);

  const navItems: GardenCommitteeNavItem[] = sections.map((section) => {
    const Icon = ADMIN_SECTION_ICONS[section];
    return {
      key: section,
      label: COMMITTEE_SECTION_LABELS[section],
      icon: Icon ? <Icon /> : undefined,
      testId: `admin-committee-section-${section}`,
      isNew: section === "projects",
    };
  });

  return (
    <CommitteeSurfaceProvider value="admin-garden">
      <GardenCommitteeWorkspaceLayout
        theme={theme}
        committee={committee}
        navItems={navItems}
        activeSection={resolvedSection}
        activeSectionLabel={COMMITTEE_SECTION_LABELS[resolvedSection]}
        onSectionChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
        onBack={onBack}
        backLabel={backLabel}
        navTestId="admin-committee-section-nav"
        fillContent={fillContent}
        roleChip={<GChip tone="neutral">School admin</GChip>}
        statusLine={statusLine}
      >
        <AdminGardenSkin theme={theme}>
          <div className={`sf-admin-garden-skin ${fillContent ? "flex h-full min-h-0 flex-1 flex-col" : ""}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={resolvedSection}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={fillContent ? "flex h-full min-h-0 flex-1 flex-col" : undefined}
              >
                {resolvedSection === "home" && (
                  <CommitteeHomeSection
                    committee={committee}
                    theme={sectionTheme}
                    organizationId={organizationId}
                    schoolSlug={schoolSlug}
                    activitySurface={readOnly ? "parent" : "admin"}
                    onNavigate={onSectionChange}
                  />
                )}
                {resolvedSection === "about" && (
                  <CommitteeAboutSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    readOnly={readOnly}
                  />
                )}
                {resolvedSection === "resources" && (
                  <CommitteeResourcesSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    readOnly={readOnly}
                  />
                )}
                {resolvedSection === "calendar" && (
                  <CommitteeCalendarSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    readOnly={readOnly}
                  />
                )}
                {resolvedSection === "tasks" && (
                  <CommitteeTasksSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    readOnly={readOnly}
                  />
                )}
                {!readOnly && resolvedSection === "projects" && (
                  <CommitteeProjectsSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    readOnly={readOnly}
                    portalApiNamespace="school-admin"
                    initialProjectId={initialProjectId}
                  />
                )}
                {resolvedSection === "messages" && (
                  <CommitteeMessagesSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    readOnly={readOnly}
                    composeTokens={resolvedComposeTokens}
                    messagesApiBase="/api/school-admin/committees"
                  />
                )}
                {resolvedSection === "members" && (
                  <CommitteeWorkspaceSectionFrame width="wide">
                    <div className="space-y-5">
                      {!readOnly && schoolSlug && (
                        <CommitteeJoinRequestsPanel
                          organizationId={organizationId}
                          schoolSlug={schoolSlug}
                          committeeId={committee.id}
                          committeeDutyRoles={committeeDutyRoles}
                          compact
                          onChanged={async () => {
                            onJoinRequestsChanged?.();
                            const updated = await getCommittee(supabase, organizationId, committee.id);
                            if (updated) onCommitteeChange(updated);
                          }}
                        />
                      )}
                      <CommitteeMembersSection
                        committee={committee}
                        theme={sectionTheme}
                        supabase={supabase}
                        organizationId={organizationId}
                        onCommitteeChange={onCommitteeChange}
                        readOnly={readOnly}
                        skipFrame
                      />
                    </div>
                  </CommitteeWorkspaceSectionFrame>
                )}
                {!readOnly && resolvedSection === "activity" && schoolSlug && (
                  <CommitteeActivitySection
                    organizationId={organizationId}
                    committeeId={committee.id}
                    slug={schoolSlug}
                    theme={sectionTheme}
                  />
                )}
                {!readOnly && resolvedSection === "settings" && (
                  <CommitteeSettingsSection
                    committee={committee}
                    theme={sectionTheme}
                    supabase={supabase}
                    organizationId={organizationId}
                    onCommitteeChange={onCommitteeChange}
                    onArchive={onArchive}
                    onNavigateToSection={onSectionChange}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </AdminGardenSkin>
      </GardenCommitteeWorkspaceLayout>
    </CommitteeSurfaceProvider>
  );
}
