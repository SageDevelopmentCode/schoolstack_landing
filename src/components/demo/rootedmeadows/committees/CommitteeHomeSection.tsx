"use client";

import { ArrowRight, CalendarDays, CheckSquare, FileText, MessageCircle } from "lucide-react";
import type { Committee, CommitteeWorkspaceSection } from "./types";
import {
  getMemberDutyRoles,
  getMemberTasks,
  TASK_STATUS_LABELS,
} from "./committeeTaskUtils";

const QUICK_LINKS = [
  { section: "resources" as const, label: "Resources", icon: FileText },
  { section: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { section: "messages" as const, label: "Messages", icon: MessageCircle },
];

export default function CommitteeHomeSection({
  committee,
  onNavigate,
  currentUserId,
  compact = false,
}: {
  committee: Committee;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
  currentUserId?: string;
  compact?: boolean;
}) {
  const upcomingEvents = committee.events.slice(0, 3);
  const myDutyRoles = currentUserId ? getMemberDutyRoles(committee, currentUserId) : [];
  const myTasks = currentUserId
    ? getMemberTasks(committee, currentUserId).filter((t) => t.status !== "done").slice(0, 4)
    : [];
  const urgentTasks = currentUserId
    ? myTasks
    : committee.tasks.filter((t) => t.status !== "done").slice(0, 4);
  const leaders = committee.members.filter((m) => m.role === "lead");
  const tasksPanelTitle = currentUserId ? "Your tasks" : "Action items";

  const quickLinks = QUICK_LINKS.map(({ section, label, icon }) => ({
    section,
    label,
    icon,
    sub:
      section === "resources"
        ? `${committee.resources.length} guides & links`
        : section === "calendar"
          ? `${committee.events.length} upcoming dates`
          : `${committee.messages.length} recent posts`,
  }));

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div
        className={`bg-gradient-to-br from-[#827096]/8 to-[#b3b462]/8 border border-[#827096]/15 rounded-2xl ${
          compact ? "p-4" : "p-6"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[#827096] mb-2">
          {committee.termLabel}
        </p>
        <h2
          className={`font-heading font-semibold text-gray-800 mb-2 ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          Welcome to {committee.name}
        </h2>
        <p
          className={`text-gray-600 leading-relaxed max-w-2xl ${
            compact ? "text-xs line-clamp-3" : "text-sm"
          }`}
        >
          {committee.description}
        </p>
        {myDutyRoles.length > 0 && (
          <p className={`text-xs text-gray-500 ${compact ? "mt-2" : "mt-3"}`}>
            Your role:{" "}
            <span className="inline-flex items-center font-semibold text-[#827096] bg-[#827096]/10 px-2 py-0.5 rounded-full">
              {myDutyRoles.map((r) => r.title).join(", ")}
            </span>
          </p>
        )}
        {leaders.length > 0 && (
          <p className={`text-xs text-gray-500 ${compact ? "mt-2" : "mt-3"}`}>
            Committee lead{leaders.length > 1 ? "s" : ""}:{" "}
            <span className="font-medium text-gray-700">
              {leaders.map((l) => l.name).join(", ")}
            </span>
          </p>
        )}
      </div>

      {compact ? (
        <div className="flex flex-col gap-2">
          {quickLinks.map(({ section, label, icon: Icon, sub }) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#827096]/30 hover:bg-[#827096]/3 transition-colors text-left cursor-pointer group w-full"
            >
              <div className="w-9 h-9 rounded-xl bg-[#827096]/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#827096]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#827096] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map(({ section, label, icon: Icon, sub }) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#827096]/30 hover:bg-[#827096]/3 transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#827096]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#827096]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#827096] transition-colors" />
            </button>
          ))}
        </div>
      )}

      <div className={compact ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
        <section
          className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${
            compact ? "p-4" : "p-5"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming dates</h3>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-xs text-[#827096] font-medium hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#b3b462]/15 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#5C5A30] uppercase">
                    {new Date(e.date + "T00:00:00").toLocaleString("en-US", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-[#5C5A30] leading-none">
                    {new Date(e.date + "T00:00:00").getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400 capitalize break-words">
                    {e.type}
                    {e.time ? ` · ${e.time}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${
            compact ? "p-4" : "p-5"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">{tasksPanelTitle}</h3>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs text-[#827096] font-medium hover:underline cursor-pointer"
            >
              View tasks
            </button>
          </div>
          <div className="space-y-2">
            {urgentTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">
                {currentUserId ? "No tasks assigned to you yet." : "No open tasks."}
              </p>
            ) : (
              urgentTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <CheckSquare className="w-4 h-4 text-[#827096] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm text-gray-800 ${
                        compact ? "line-clamp-2" : "truncate"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-400 break-words">
                      {currentUserId
                        ? `${TASK_STATUS_LABELS[t.status]} · `
                        : t.assigneeName
                          ? `${t.assigneeName} · `
                          : ""}
                      {t.dueDate
                        ? `Due ${new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : "No due date"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
