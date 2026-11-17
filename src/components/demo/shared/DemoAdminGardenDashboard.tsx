"use client";

import { useMemo } from "react";
import DemoAdminGardenShell from "@/components/demo/shared/DemoAdminGardenShell";
import AdminGardenDashboard from "@/components/school-admin/dashboard/garden/AdminGardenDashboard";
import { buildDemoAdminDashboardSummary } from "@/data/school-demos/demo-admin-dashboard-summary";
import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  DEMO_ADMIN_FEATURES,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
import { toDateKey } from "@/lib/school-teacher/my-hours/format-duration";

const DEMO_ADMIN_FIRST_NAME = "Morgan";

/** The fixture roster is dated; move it (and its timestamps) to today so the board reads "Today". */
function withAttendanceToday(summary: AdminDashboardSummary): AdminDashboardSummary {
  const attendance = summary.attendanceToday;
  if (!attendance) return summary;
  const today = toDateKey(new Date());
  const from = attendance.date;
  const shift = (value: string | null) => (value ? value.replace(from, today) : value);
  return {
    ...summary,
    attendanceToday: {
      ...attendance,
      date: today,
      students: attendance.students.map((student) => ({
        ...student,
        presentAt: shift(student.presentAt),
        absentAt: shift(student.absentAt),
        pickedUpAt: shift(student.pickedUpAt),
      })),
    },
  };
}

/**
 * Home-page "Admin Portal" demo: the REAL Garden admin Dashboard inside the
 * real admin frame, fed by `buildDemoAdminDashboardSummary` (no network).
 * Tabs, Refresh, guides and the copy-link row work; links don't navigate and
 * the attendance board is view-only (`AdminGardenDashboard previewMode`).
 */
export default function DemoAdminGardenDashboard({ config }: { config: SchoolAdminDemoConfig }) {
  const previewPathname = useMemo(() => schoolAdminPath(DEMO_PORTAL_SLUG, "dashboard"), []);
  const initialToday = useMemo(
    () => withAttendanceToday(buildDemoAdminDashboardSummary(config.copy)),
    [config.copy],
  );

  return (
    <DemoAdminGardenShell
      config={config}
      previewPathname={previewPathname}
      data-testid="demo-admin-garden-dashboard"
    >
      {({ schoolName }) => (
        <AdminGardenDashboard
          previewMode
          organizationId={DEMO_PORTAL_ORG_ID}
          slug={DEMO_PORTAL_SLUG}
          plan="custom"
          features={DEMO_ADMIN_FEATURES}
          userFirstName={DEMO_ADMIN_FIRST_NAME}
          schoolName={schoolName}
          initialToday={initialToday}
        />
      )}
    </DemoAdminGardenShell>
  );
}
