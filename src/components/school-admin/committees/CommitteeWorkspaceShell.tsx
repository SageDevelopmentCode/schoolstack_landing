"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { getCommittee } from "@/lib/committees/committees";
import CommitteeHomeSection from "./sections/CommitteeHomeSection";
import CommitteeAboutSection from "./sections/CommitteeAboutSection";
import CommitteeResourcesSection from "./sections/CommitteeResourcesSection";
import CommitteeCalendarSection from "./sections/CommitteeCalendarSection";
import CommitteeTasksSection from "./sections/CommitteeTasksSection";
import CommitteeMessagesSection from "./sections/CommitteeMessagesSection";
import CommitteeMembersSection from "./sections/CommitteeMembersSection";
import CommitteeSettingsSection from "./sections/CommitteeSettingsSection";
import CommitteeActivitySection from "./sections/CommitteeActivitySection";
import CommitteeJoinRequestsPanel from "./CommitteeJoinRequestsPanel";
import { CommitteeWorkspaceSidePanel } from "./CommitteeWorkspaceStoryHeader";
import CommitteeWorkspaceLayout from "./CommitteeWorkspaceLayout";
import CommitteeWorkspaceSectionFrame from "./CommitteeWorkspaceSectionFrame";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";

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
}) {
  const { C: shellComposeTokens } = useSchoolAdminStoryTheme();
  const resolvedComposeTokens = composeTokens ?? shellComposeTokens;
  const sections = (readOnly
    ? committee.config.sections
    : [...committee.config.sections, "activity", "settings"]
  ).filter((section, index, arr) => arr.indexOf(section) === index) as CommitteeWorkspaceSection[];

  const fillContent = activeSection === "messages";

  return (
    <CommitteeWorkspaceLayout
      theme={theme}
      fillContent={fillContent}
      contentClassName="!px-[clamp(25px,4vw,56px)] !py-[30px] pb-14"
      contentInnerClassName="!max-w-[1350px]"
      sidePanel={
        <CommitteeWorkspaceSidePanel
          committee={committee}
          theme={theme}
          sections={sections}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onBack={onBack}
          backLabel={backLabel}
          variant="admin"
        />
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={fillContent ? "flex h-full min-h-0 flex-1 flex-col" : undefined}
        >
          {activeSection === "home" && (
            <CommitteeHomeSection
              committee={committee}
              theme={theme}
              organizationId={organizationId}
              schoolSlug={schoolSlug}
              activitySurface={readOnly ? "parent" : "admin"}
              onNavigate={onSectionChange}
            />
          )}
          {activeSection === "about" && (
            <CommitteeAboutSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              readOnly={readOnly}
            />
          )}
          {activeSection === "resources" && (
            <CommitteeResourcesSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              readOnly={readOnly}
            />
          )}
          {activeSection === "calendar" && (
            <CommitteeCalendarSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              readOnly={readOnly}
            />
          )}
          {activeSection === "tasks" && (
            <CommitteeTasksSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              readOnly={readOnly}
            />
          )}
          {activeSection === "messages" && (
            <CommitteeMessagesSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              readOnly={readOnly}
              composeTokens={resolvedComposeTokens}
            />
          )}
          {activeSection === "members" && (
            <CommitteeWorkspaceSectionFrame width="narrow">
              <div className="space-y-6">
                {!readOnly && schoolSlug && (
                  <CommitteeJoinRequestsPanel
                    organizationId={organizationId}
                    schoolSlug={schoolSlug}
                    committeeId={committee.id}
                    committeeDutyRoles={committee.dutyRoles.map((dutyRole) => ({
                      id: dutyRole.id,
                      title: dutyRole.title,
                      assigneeId: dutyRole.assigneeId,
                      assigneeName: committee.members.find(
                        (member) => member.id === dutyRole.assigneeId,
                      )?.name,
                    }))}
                    theme={theme}
                    compact
                    onChanged={async () => {
                      onJoinRequestsChanged?.();
                      const updated = await getCommittee(
                        supabase,
                        organizationId,
                        committee.id,
                      );
                      if (updated) onCommitteeChange(updated);
                    }}
                  />
                )}
                <CommitteeMembersSection
                  committee={committee}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  onCommitteeChange={onCommitteeChange}
                  readOnly={readOnly}
                  skipFrame
                />
              </div>
            </CommitteeWorkspaceSectionFrame>
          )}
          {!readOnly && activeSection === "activity" && schoolSlug && (
            <CommitteeActivitySection
              organizationId={organizationId}
              committeeId={committee.id}
              slug={schoolSlug}
              theme={theme}
            />
          )}
          {!readOnly && activeSection === "settings" && (
            <CommitteeSettingsSection
              committee={committee}
              theme={theme}
              supabase={supabase}
              organizationId={organizationId}
              onCommitteeChange={onCommitteeChange}
              onArchive={onArchive}
              onNavigateToSection={onSectionChange}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </CommitteeWorkspaceLayout>
  );
}
