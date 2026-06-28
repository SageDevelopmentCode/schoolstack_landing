"use client";

import { ArrowRight, CalendarDays, CheckSquare, FileText, MessageCircle } from "lucide-react";
import type { Committee, CommitteeWorkspaceSection } from "./types";

export default function CommitteeHomeSection({
  committee,
  onNavigate,
}: {
  committee: Committee;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
}) {
  const upcomingEvents = committee.events.slice(0, 3);
  const urgentTasks = committee.tasks
    .filter((t) => t.status !== "done")
    .slice(0, 4);
  const leaders = committee.members.filter((m) => m.role === "lead");

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#827096]/8 to-[#b3b462]/8 border border-[#827096]/15 rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#827096] mb-2">
          {committee.termLabel}
        </p>
        <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
          Welcome to {committee.name}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
          {committee.description}
        </p>
        {leaders.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Committee lead{leaders.length > 1 ? "s" : ""}:{" "}
            <span className="font-medium text-gray-700">
              {leaders.map((l) => l.name).join(", ")}
            </span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { section: "resources" as const, label: "Resources", icon: FileText, sub: `${committee.resources.length} guides & links` },
          { section: "calendar" as const, label: "Calendar", icon: CalendarDays, sub: `${committee.events.length} upcoming dates` },
          { section: "messages" as const, label: "Messages", icon: MessageCircle, sub: `${committee.messages.length} recent posts` },
        ].map(({ section, label, icon: Icon, sub }) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
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
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {e.type}
                    {e.time ? ` · ${e.time}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Action items</h3>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs text-[#827096] font-medium hover:underline cursor-pointer"
            >
              View tasks
            </button>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <CheckSquare className="w-4 h-4 text-[#827096] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">
                    {t.assigneeName ? `${t.assigneeName} · ` : ""}
                    {t.dueDate
                      ? `Due ${new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "No due date"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
