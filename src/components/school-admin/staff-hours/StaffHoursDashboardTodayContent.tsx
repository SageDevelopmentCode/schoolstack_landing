"use client";

import type { ReactNode } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { StaffHoursLiveElapsed } from "@/components/school-admin/staff-hours/StaffHoursLiveElapsed";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { AdminDashboardStaffHoursToday } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-dashboard-today";

const TABLE_LINE = "#EDF1ED";
const ACCENT_SKY = "#8ABAC6";
const ACCENT_FOREST = "#315E4F";

type StaffHoursDashboardTodayContentProps = {
  data: AdminDashboardStaffHoursToday;
  staffHoursHref: string;
};

function EmptyCopy({ children }: { children: string }) {
  const { theme } = useSchoolAdminStoryTheme();
  return (
    <p className="text-sm" style={{ color: theme.muted }}>
      {children}
    </p>
  );
}

function AccentPanel({
  accentColor,
  title,
  children,
}: {
  accentColor: string;
  title: string;
  children: ReactNode;
}) {
  const { theme, C } = useSchoolAdminStoryTheme();
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-3 sm:p-4"
      style={{ borderColor: TABLE_LINE, backgroundColor: C.elevated }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
      <p
        className="mb-2 pl-2 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: theme.muted }}
      >
        {title}
      </p>
      <div className="pl-2">{children}</div>
    </div>
  );
}

export function StaffHoursDashboardTodayContent({
  data,
  staffHoursHref,
}: StaffHoursDashboardTodayContentProps) {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3
          className="m-0 font-heading text-2xl font-semibold tracking-[-0.03em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Staff hours · Today
        </h3>
        <ParentTextLink theme={theme} href={staffHoursHref}>
          Open Staff hours
        </ParentTextLink>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AdminMetricCard
          theme={theme}
          value={String(data.clockedInCount)}
          label="Clocked in now"
          accent="sky"
        />
        <AdminMetricCard
          theme={theme}
          value={String(data.completedSessionCount)}
          label="Sessions done today"
          accent="forest"
        />
        <AdminMetricCard
          theme={theme}
          value={data.totalHoursLabel}
          label="Logged today"
          accent="gold"
        />
      </div>

      <p className="mb-4 text-sm" style={{ color: C.textSecondary }}>
        {data.summaryLine}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AccentPanel accentColor={ACCENT_SKY} title="Clocked in">
          {data.clockedIn.length === 0 ? (
            <EmptyCopy>No one is clocked in right now.</EmptyCopy>
          ) : (
            <ul className="m-0 list-none space-y-2 p-0">
              {data.clockedIn.map((row) => (
                <li
                  key={row.staffMemberId}
                  className="flex items-baseline justify-between gap-2 text-sm"
                  style={{ color: theme.ink }}
                >
                  <span className="min-w-0 truncate font-medium">{row.staffName}</span>
                  <span className="shrink-0 tabular-nums" style={{ color: C.textSecondary }}>
                    {row.clockInLabel}
                    <span aria-hidden="true"> · </span>
                    <span className="font-semibold" style={{ color: ACCENT_FOREST }}>
                      <StaffHoursLiveElapsed clockInAt={row.clockInAt} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccentPanel>

        <AccentPanel accentColor={ACCENT_FOREST} title="Completed today">
          {data.completedToday.length === 0 ? (
            <EmptyCopy>No completed sessions yet today.</EmptyCopy>
          ) : (
            <>
              <ul className="m-0 list-none space-y-2 p-0">
                {data.completedToday.map((row) => (
                  <li
                    key={`${row.staffMemberId}-${row.clockInLabel}-${row.clockOutLabel}`}
                    className="flex items-baseline justify-between gap-2 text-sm"
                    style={{ color: theme.ink }}
                  >
                    <span className="min-w-0 truncate font-medium">{row.staffName}</span>
                    <span
                      className="shrink-0 text-right tabular-nums"
                      style={{ color: C.textSecondary }}
                    >
                      {row.clockInLabel} – {row.clockOutLabel}
                      <span aria-hidden="true"> · </span>
                      <span className="font-semibold" style={{ color: ACCENT_FOREST }}>
                        {row.durationLabel}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {data.hiddenCompletedCount > 0 ? (
                <p className="mt-3 text-xs" style={{ color: theme.muted }}>
                  +{data.hiddenCompletedCount} more on Staff hours
                </p>
              ) : null}
            </>
          )}
        </AccentPanel>
      </div>
    </section>
  );
}
