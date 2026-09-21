"use client";

import AttendancePage from "@/components/school-admin/attendance/AttendancePage";
import SchoolAdminStoryShell from "@/components/school-admin/SchoolAdminStoryShell";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherAttendancePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  previewMode?: boolean;
};

export default function TeacherAttendancePage({
  organizationId,
  branding,
  slug,
  previewMode = false,
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
        sectionKicker="Your classroom"
      />
    </SchoolAdminStoryShell>
  );
}
