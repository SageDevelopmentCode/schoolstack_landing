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
import {
  COMMITTEE_SECTION_LABELS,
  getCommitteeTemplate,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeWorkspaceSection } from "./types";
import CommitteeHomeSection from "./CommitteeHomeSection";
import CommitteeAboutSection from "./CommitteeAboutSection";
import CommitteeResourcesSection from "./CommitteeResourcesSection";
import CommitteeCalendarSection from "./CommitteeCalendarSection";
import CommitteeTasksSection from "./CommitteeTasksSection";
import CommitteeMessagesSection from "./CommitteeMessagesSection";
import CommitteeMembersSection from "./CommitteeMembersSection";
import CommitteeSettingsSection from "./CommitteeSettingsSection";

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
  activeSection,
  onSectionChange,
  onBack,
  showSettings = false,
  isAdminView = false,
  onCommitteeUpdate,
  currentUserId,
  onArchive,
  compact = false,
}: {
  committee: Committee;
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
  onBack?: () => void;
  showSettings?: boolean;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
  currentUserId?: string;
  onArchive?: () => void;
  compact?: boolean;
}) {
  const template = getCommitteeTemplate(committee.templateId);
  const sections = (template?.sections ?? ["home", "about", "resources", "calendar", "tasks", "messages", "members"]).filter(
    (s) => s !== "settings" || showSettings,
  );
  if (showSettings && !sections.includes("settings")) {
    sections.push("settings");
  }

  const leaders = committee.members.filter((m) => m.role === "lead");

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className={`border-b border-gray-100 bg-white shrink-0 ${
          compact ? "px-3 pt-2 pb-2" : "px-6 pt-3 pb-3"
        }`}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#827096] mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All committees
          </button>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={
                compact
                  ? "flex flex-col items-start gap-1"
                  : "flex items-center gap-2 flex-wrap"
              }
            >
              <h1
                className={`font-heading font-semibold text-gray-800 ${
                  compact ? "text-base" : "text-xl"
                }`}
              >
                {committee.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096]">
                  {committee.termLabel}
                </span>
                {committee.status === "archived" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    Archived
                  </span>
                )}
              </div>
            </div>
            {!compact && (
              <>
                <p className="text-sm text-gray-500 mt-1">{committee.description}</p>
                {leaders.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Led by {leaders.map((l) => l.name).join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className={`relative ${compact ? "mt-2" : "mt-4"}`}>
          <nav
            className={`flex items-center gap-1 overflow-x-auto pb-1 ${
              compact ? "pr-6" : ""
            }`}
          >
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section];
              return (
                <button
                  key={section}
                  onClick={() => onSectionChange(section)}
                  className={`flex items-center gap-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    compact ? "px-2 py-1" : "px-3 py-1.5"
                  } ${
                    activeSection === section
                      ? "text-[#827096] bg-[#827096]/8 font-semibold"
                      : "text-gray-500 hover:text-[#827096] hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {COMMITTEE_SECTION_LABELS[section]}
                </button>
              );
            })}
          </nav>
          {compact && (
            <div
              className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent pointer-events-none"
              aria-hidden
            />
          )}
        </div>
      </div>

      <div
        className={
          activeSection === "messages"
            ? "flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50/50"
            : `flex-1 overflow-y-auto bg-gray-50/50 ${compact ? "p-3" : "p-6"}`
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
              activeSection === "messages" ? "flex flex-col flex-1 min-h-0 h-full" : undefined
            }
          >
            {activeSection === "home" && (
              <CommitteeHomeSection
                committee={committee}
                onNavigate={onSectionChange}
                currentUserId={currentUserId}
                compact={compact}
              />
            )}
            {activeSection === "about" && (
              <CommitteeAboutSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
                currentUserId={currentUserId}
              />
            )}
            {activeSection === "resources" && (
              <CommitteeResourcesSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
                currentUserId={currentUserId}
              />
            )}
            {activeSection === "calendar" && (
              <CommitteeCalendarSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
              />
            )}
            {activeSection === "tasks" && (
              <CommitteeTasksSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
                currentUserId={currentUserId}
              />
            )}
            {activeSection === "messages" && (
              <CommitteeMessagesSection committee={committee} currentUserId={currentUserId} />
            )}
            {activeSection === "members" && (
              <CommitteeMembersSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
              />
            )}
            {activeSection === "settings" && showSettings && (
              <CommitteeSettingsSection
                committee={committee}
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
