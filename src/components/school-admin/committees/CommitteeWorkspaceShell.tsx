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
import { motion, AnimatePresence } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceSection,
} from "@/lib/committees/types";
import CommitteeHomeSection from "./sections/CommitteeHomeSection";
import CommitteeAboutSection from "./sections/CommitteeAboutSection";
import CommitteeResourcesSection from "./sections/CommitteeResourcesSection";
import CommitteeCalendarSection from "./sections/CommitteeCalendarSection";
import CommitteeTasksSection from "./sections/CommitteeTasksSection";
import CommitteeMessagesSection from "./sections/CommitteeMessagesSection";
import CommitteeMembersSection from "./sections/CommitteeMembersSection";
import CommitteeSettingsSection from "./sections/CommitteeSettingsSection";
import CommitteeJoinRequestsPanel from "./CommitteeJoinRequestsPanel";

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

export default function CommitteeWorkspaceShell({
  committee,
  C,
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
  C: AdminThemeTokens;
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
  ).filter((s, i, arr) => arr.indexOf(s) === i) as CommitteeWorkspaceSection[];

  const leaders = committee.members.filter((m) => m.role === "lead");

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="border-b shrink-0 px-6 pt-3 pb-3"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs mb-2 cursor-pointer transition-colors"
            style={{ color: C.textTertiary }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="font-heading font-semibold text-xl"
              style={{ color: C.textPrimary }}
            >
              {committee.name}
            </h1>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {committee.termLabel}
            </span>
            {committee.status === "archived" && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ backgroundColor: C.border, color: C.textSecondary }}
              >
                Archived
              </span>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
            {committee.description}
          </p>
          {leaders.length > 0 && (
            <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
              Led by {leaders.map((l) => l.name).join(", ")}
            </p>
          )}
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto mt-4 pb-1">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section];
            const active = activeSection === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => onSectionChange(section)}
                className="flex items-center gap-1.5 text-xs font-medium rounded-lg whitespace-nowrap px-3 py-1.5 cursor-pointer transition-colors"
                style={{
                  color: active ? C.accent : C.textSecondary,
                  backgroundColor: active ? C.accentLight : "transparent",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {COMMITTEE_SECTION_LABELS[section]}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className={
          activeSection === "messages"
            ? "flex-1 flex flex-col min-h-0 overflow-hidden"
            : "flex-1 overflow-y-auto p-6"
        }
        style={{ backgroundColor: C.bg }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={
              activeSection === "messages" ? "flex flex-col flex-1 min-h-0 h-full" : undefined
            }
          >
            {activeSection === "home" && (
              <CommitteeHomeSection committee={committee} C={C} onNavigate={onSectionChange} />
            )}
            {activeSection === "about" && (
              <CommitteeAboutSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly={readOnly}
              />
            )}
            {activeSection === "resources" && (
              <CommitteeResourcesSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly={readOnly}
              />
            )}
            {activeSection === "calendar" && (
              <CommitteeCalendarSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly={readOnly}
              />
            )}
            {activeSection === "tasks" && (
              <CommitteeTasksSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly={readOnly}
              />
            )}
            {activeSection === "messages" && (
              <CommitteeMessagesSection
                committee={committee}
                C={C}
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
                    C={C}
                    compact
                    onChanged={() => {
                      onJoinRequestsChanged?.();
                    }}
                  />
                )}
                <CommitteeMembersSection
                  committee={committee}
                  C={C}
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
                C={C}
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
  );
}
