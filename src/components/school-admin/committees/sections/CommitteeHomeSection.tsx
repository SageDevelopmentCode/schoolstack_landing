"use client";

import { CalendarDays, CheckSquare, FileText, MessageCircle } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { Committee, CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const QUICK_LINKS = [
  { section: "resources" as const, label: "Resources", icon: FileText, accent: "forest" as const },
  { section: "calendar" as const, label: "Calendar", icon: CalendarDays, accent: "sky" as const },
  { section: "messages" as const, label: "Messages", icon: MessageCircle, accent: "gold" as const },
];

export default function CommitteeHomeSection({
  committee,
  theme,
  onNavigate,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
}) {
  const upcomingEvents = committee.events.slice(0, 3);
  const urgentTasks = committee.tasks.filter((task) => task.status !== "done").slice(0, 4);
  const leaders = committee.members.filter((member) => member.role === "lead");

  const quickLinks = QUICK_LINKS.map(({ section, label, icon, accent }) => ({
    section,
    label,
    icon,
    accent,
    sub:
      section === "resources"
        ? `${committee.resources.length} guides & links`
        : section === "calendar"
          ? `${committee.events.length} upcoming dates`
          : `${committee.messages.length} recent posts`,
  }));

  return (
    <div className="space-y-6">
      <AdminCard
        theme={theme}
        padding="canvas"
        style={{ backgroundColor: "#EAF4EB", borderColor: "#C7DFCB" }}
      >
        <AdminSectionKicker theme={theme}>{committee.termLabel}</AdminSectionKicker>
        <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
          Welcome to {committee.name}
        </AdminDisplayHeading>
        <p className="text-sm leading-relaxed max-w-2xl mt-2" style={{ color: theme.muted }}>
          {committee.description}
        </p>
        {leaders.length > 0 && (
          <p className="text-xs mt-3" style={{ color: theme.muted }}>
            Led by {leaders.map((leader) => leader.name).join(", ")}
          </p>
        )}
      </AdminCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[13px]">
        {quickLinks.map(({ section, label, sub, accent }) => (
          <AdminMetricCard
            key={section}
            theme={theme}
            value={sub.split(" ")[0]}
            label={`${label} · ${sub}`}
            accent={accent}
            onClick={() => onNavigate(section)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard theme={theme} padding="default">
          <div className="flex items-center justify-between mb-3">
            <AdminDisplayHeading theme={theme} as="h3" size="section">
              Upcoming dates
            </AdminDisplayHeading>
            <AdminTextLink theme={theme} onClick={() => onNavigate("calendar")}>
              View all →
            </AdminTextLink>
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm" style={{ color: theme.muted }}>No upcoming dates.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 p-3 rounded-xl border"
                  style={{ borderColor: "#E0E7E0", backgroundColor: theme.white }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: "#EAF4EB", color: theme.primary }}
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
                    <p className="text-sm font-medium" style={{ color: theme.ink }}>
                      {event.title}
                    </p>
                    <p className="text-xs capitalize" style={{ color: theme.muted }}>
                      {event.type}
                      {event.time ? ` · ${event.time}` : ""}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard theme={theme} padding="default">
          <div className="flex items-center justify-between mb-3">
            <AdminDisplayHeading theme={theme} as="h3" size="section">
              Action items
            </AdminDisplayHeading>
            <AdminTextLink theme={theme} onClick={() => onNavigate("tasks")}>
              View tasks →
            </AdminTextLink>
          </div>
          <div className="space-y-2">
            {urgentTasks.length === 0 ? (
              <p className="text-sm" style={{ color: theme.muted }}>No open tasks.</p>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-3 rounded-xl border"
                  style={{ borderColor: "#E0E7E0", backgroundColor: theme.white }}
                >
                  <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.primary }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: theme.ink }}>
                      {task.title}
                    </p>
                    <p className="text-xs" style={{ color: theme.muted }}>
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
        </AdminCard>
      </div>
    </div>
  );
}
