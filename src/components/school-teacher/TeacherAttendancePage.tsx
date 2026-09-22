"use client";

import AttendancePage from "@/components/school-admin/attendance/AttendancePage";
import SchoolAdminStoryShell from "@/components/school-admin/SchoolAdminStoryShell";
import type { AttendanceRosterResponse } from "@/lib/school-admin/attendance/attendance-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherAttendancePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  previewMode?: boolean;
  initialRoster?: AttendanceRosterResponse;
};

export default function TeacherAttendancePage({
  organizationId,
  branding,
  slug,
  previewMode = false,
  initialRoster,
}: TeacherAttendancePageProps) {
  return (
    <SchoolAdminStoryShell branding={branding} className="min-h-0 flex-1">
      <AttendancePage
        organizationId={organizationId}
        branding={branding}
        slug={slug}
        apiBasePath="/api/teacher-portal/attendance"
        operationalErrorSurface="teacher_portal"
        previewMode={previewMode}
        initialRoster={initialRoster}
        sectionKicker="Your classroom"
      />
    </SchoolAdminStoryShell>
  );
}
