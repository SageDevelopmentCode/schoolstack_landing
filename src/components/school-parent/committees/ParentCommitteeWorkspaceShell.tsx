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
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
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

/**
 * Read-only parent workspace shell — omits settings/join-request admin UI and
 * code-splits section panels so the parent committees browse page stays lean.
 */
export default function ParentCommitteeWorkspaceShell({
  committee,
  C,
  supabase,
  organizationId,
  activeSection,
  onSectionChange,
  onBack,
  onCommitteeChange,
  backLabel = "My committees",
}: {
  committee: Committee;
  C: AdminThemeTokens;
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

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="border-b shrink-0 px-6 pt-3 pb-3"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs mb-2 cursor-pointer transition-colors"
            style={{ color: C.textTertiary }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </button>
        ) : null}
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
          </div>
          <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
            {committee.description}
          </p>
          {leaders.length > 0 ? (
            <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
              Led by {leaders.map((l) => l.name).join(", ")}
            </p>
          ) : null}
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
                {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
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
              activeSection === "messages"
                ? "flex flex-col flex-1 min-h-0 h-full"
                : undefined
            }
          >
            {activeSection === "home" ? (
              <CommitteeHomeSection
                committee={committee}
                C={C}
                onNavigate={onSectionChange}
              />
            ) : null}
            {activeSection === "about" ? (
              <CommitteeAboutSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly
              />
            ) : null}
            {activeSection === "resources" ? (
              <CommitteeResourcesSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly
              />
            ) : null}
            {activeSection === "calendar" ? (
              <CommitteeCalendarSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly
              />
            ) : null}
            {activeSection === "tasks" ? (
              <CommitteeTasksSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly
              />
            ) : null}
            {activeSection === "messages" ? (
              <CommitteeMessagesSection
                committee={committee}
                C={C}
                supabase={supabase}
                organizationId={organizationId}
                onCommitteeChange={onCommitteeChange}
                readOnly
              />
            ) : null}
            {activeSection === "members" ? (
              <CommitteeMembersSection
                committee={committee}
                C={C}
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
  );
}
