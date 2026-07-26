"use client";

import { ArrowRight, CalendarDays, CheckSquare, FileText, MessageCircle } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeWorkspaceSection } from "@/lib/committees/types";

const QUICK_LINKS = [
  { section: "resources" as const, label: "Resources", icon: FileText },
  { section: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { section: "messages" as const, label: "Messages", icon: MessageCircle },
];

export default function CommitteeHomeSection({
  committee,
  C,
  onNavigate,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
}) {
  const upcomingEvents = committee.events.slice(0, 3);
  const urgentTasks = committee.tasks.filter((t) => t.status !== "done").slice(0, 4);
  const leaders = committee.members.filter((m) => m.role === "lead");

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
    <div className="space-y-6">
      <div
        className="border rounded-2xl p-6"
        style={{ borderColor: C.accent, backgroundColor: C.accentLight }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.accent }}>
          {committee.termLabel}
        </p>
        <h2 className="font-heading font-semibold text-xl mb-2" style={{ color: C.textPrimary }}>
          Welcome to {committee.name}
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: C.textSecondary }}>
          {committee.description}
        </p>
        {leaders.length > 0 && (
          <p className="text-xs mt-3" style={{ color: C.textTertiary }}>
            Led by {leaders.map((l) => l.name).join(", ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickLinks.map(({ section, label, icon: Icon, sub }) => (
          <button
            key={section}
            type="button"
            onClick={() => onNavigate(section)}
            className="flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer hover:shadow-sm transition-all"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <Icon className="w-5 h-5 shrink-0" style={{ color: C.accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{label}</p>
              <p className="text-xs" style={{ color: C.textTertiary }}>{sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: C.textTertiary }} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Upcoming dates
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("calendar")}
              className="text-xs font-medium cursor-pointer"
              style={{ color: C.accent }}
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm" style={{ color: C.textTertiary }}>No upcoming dates.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 p-3 rounded-xl border"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: C.accentLight, color: C.accent }}
                  >
                    <span>
                      {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                      }).toUpperCase()}
                    </span>
                    <span>
                      {new Date(event.date + "T00:00:00").getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      {event.title}
                    </p>
                    <p className="text-xs capitalize" style={{ color: C.textTertiary }}>
                      {event.type}
                      {event.time ? ` · ${event.time}` : ""}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Action items
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("tasks")}
              className="text-xs font-medium cursor-pointer"
              style={{ color: C.accent }}
            >
              View tasks
            </button>
          </div>
          <div className="space-y-2">
            {urgentTasks.length === 0 ? (
              <p className="text-sm" style={{ color: C.textTertiary }}>No open tasks.</p>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-3 rounded-xl border"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}
                >
                  <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.accent }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      {task.title}
                    </p>
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      {task.assigneeName ?? "Unassigned"}
                      {task.dueDate
                        ? ` · Due ${new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
