"use client";

import SchoolAdminStoryShell from "@/components/school-admin/SchoolAdminStoryShell";
import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import { DashboardAttendanceSectionContent } from "@/components/school-admin/attendance/DashboardAttendanceSection";
import type { AttendanceRosterStudent, AttendanceRosterSummary } from "@/lib/school-admin/attendance/attendance-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherDashboardAttendanceSectionProps = {
  organizationId: string;
  branding: OrganizationBranding;
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
  attendanceHref: string;
  previewMode?: boolean;
  onSummaryChange?: (summary: AttendanceRosterSummary) => void;
};

export default function TeacherDashboardAttendanceSection({
  organizationId,
  branding,
  date,
  students,
  summary,
  attendanceHref,
  previewMode = false,
  onSummaryChange,
}: TeacherDashboardAttendanceSectionProps) {
  return (
    <SchoolAdminStoryShell branding={branding}>
      <AttendanceApiProvider
        apiBasePath="/api/teacher-portal/attendance"
        previewMode={previewMode}
      >
        <DashboardAttendanceSectionContent
          organizationId={organizationId}
          date={date}
          students={students}
          summary={summary}
          attendanceHref={attendanceHref}
          previewMode={previewMode}
          operationalErrorSurface="teacher_portal"
          onSummaryChange={onSummaryChange}
        />
      </AttendanceApiProvider>
    </SchoolAdminStoryShell>
  );
}
