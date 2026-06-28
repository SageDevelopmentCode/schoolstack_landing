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
      <div className="px-6 pt-3 pb-3 border-b border-gray-100 bg-white shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#827096] mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All committees
          </button>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-heading font-semibold text-gray-800">
                {committee.name}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096]">
                {committee.termLabel}
              </span>
              {committee.status === "archived" && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  Archived
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{committee.description}</p>
            {leaders.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Led by {leaders.map((l) => l.name).join(", ")}
              </p>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section];
            return (
              <button
                key={section}
                onClick={() => onSectionChange(section)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === "home" && (
              <CommitteeHomeSection committee={committee} onNavigate={onSectionChange} />
            )}
            {activeSection === "about" && <CommitteeAboutSection committee={committee} />}
            {activeSection === "resources" && (
              <CommitteeResourcesSection
                committee={committee}
                isAdminView={isAdminView}
                onCommitteeUpdate={onCommitteeUpdate}
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
