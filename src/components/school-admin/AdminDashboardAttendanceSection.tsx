"use client";

import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import { DashboardAttendanceSectionContent } from "@/components/school-admin/attendance/DashboardAttendanceSection";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AttendanceRosterStudent, AttendanceRosterSummary } from "@/lib/school-admin/attendance/attendance-types";

type AdminDashboardAttendanceSectionProps = {
  organizationId: string;
  slug: string;
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
  onSummaryChange?: (summary: AttendanceRosterSummary) => void;
};

export default function AdminDashboardAttendanceSection({
  organizationId,
  slug,
  date,
  students,
  summary,
  onSummaryChange,
}: AdminDashboardAttendanceSectionProps) {
  const attendanceHref = schoolAdminPath(slug, "my_school", "attendance");

  return (
    <AttendanceApiProvider apiBasePath="/api/school-admin/attendance">
      <DashboardAttendanceSectionContent
        organizationId={organizationId}
        date={date}
        students={students}
        summary={summary}
        attendanceHref={attendanceHref}
        gridClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        operationalErrorSurface="school_admin"
        onSummaryChange={onSummaryChange}
      />
    </AttendanceApiProvider>
  );
}
