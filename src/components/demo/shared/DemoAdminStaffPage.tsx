"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import StaffPage from "@/components/school-admin/staff/StaffPage";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { buildDemoStaffMembers } from "@/data/school-demos/demo-admin-myschool-fixtures";

type DemoAdminStaffPageProps = {
  initialSelectedStaffId?: string;
};

export default function DemoAdminStaffPage({
  initialSelectedStaffId = "staff-jordan",
}: DemoAdminStaffPageProps) {
  const staff = useMemo(() => buildDemoStaffMembers(), []);
  const branding = useMemo(() => buildDemoAdminBranding(), []);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none h-full select-none">
        <StaffPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          initialStaff={staff}
          initialSelectedStaffId={initialSelectedStaffId}
          previewMode
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
