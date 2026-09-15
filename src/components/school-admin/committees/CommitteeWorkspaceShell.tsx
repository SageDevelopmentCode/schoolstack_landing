"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import CommitteeHomeSection from "./sections/CommitteeHomeSection";
import CommitteeAboutSection from "./sections/CommitteeAboutSection";
import CommitteeResourcesSection from "./sections/CommitteeResourcesSection";
import CommitteeCalendarSection from "./sections/CommitteeCalendarSection";
import CommitteeTasksSection from "./sections/CommitteeTasksSection";
import CommitteeMessagesSection from "./sections/CommitteeMessagesSection";
import CommitteeMembersSection from "./sections/CommitteeMembersSection";
import CommitteeSettingsSection from "./sections/CommitteeSettingsSection";
import CommitteeJoinRequestsPanel from "./CommitteeJoinRequestsPanel";
import CommitteeWorkspaceStoryHeader from "./CommitteeWorkspaceStoryHeader";

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
}: {
  committee: Committee;
  theme: ParentThemeTokens;
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
  const sections = (readOnly
    ? committee.config.sections
    : [...committee.config.sections, "settings"]
  ).filter((section, index, arr) => arr.indexOf(section) === index) as CommitteeWorkspaceSection[];

  const isMessages = activeSection === "messages";

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className={isMessages ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}>
        <div
          className={
            isMessages
              ? "mx-auto flex h-full min-h-0 w-full max-w-[1350px] flex-col px-[clamp(25px,4vw,56px)] py-[30px]"
              : "mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14"
          }
        >
          <CommitteeWorkspaceStoryHeader
            committee={committee}
            theme={theme}
            sections={sections}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            onBack={onBack}
            backLabel={backLabel}
          />

          <div
            className={
              isMessages
                ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border"
                : undefined
            }
            style={
              isMessages
                ? { backgroundColor: "#EFF5F0", borderColor: "#DCE4DC" }
                : undefined
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={
                  isMessages ? "flex min-h-0 flex-1 flex-col overflow-hidden" : undefined
                }
              >
                {activeSection === "home" && (
                  <CommitteeHomeSection committee={committee} theme={theme} onNavigate={onSectionChange} />
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
                  />
                )}
                {activeSection === "members" && (
                  <div className="space-y-6">
                    {!readOnly && schoolSlug && (
                      <CommitteeJoinRequestsPanel
                        organizationId={organizationId}
                        schoolSlug={schoolSlug}
                        committeeId={committee.id}
                        theme={theme}
                        compact
                        onChanged={() => {
                          onJoinRequestsChanged?.();
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
                    />
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
