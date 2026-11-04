"use client";

import { StaffHoursDashboardTodayContent } from "@/components/school-admin/staff-hours/StaffHoursDashboardTodayContent";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminDashboardStaffHoursToday } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-dashboard-today";

type AdminDashboardStaffHoursSectionProps = {
  slug: string;
  data: AdminDashboardStaffHoursToday;
};

export default function AdminDashboardStaffHoursSection({
  slug,
  data,
}: AdminDashboardStaffHoursSectionProps) {
  const staffHoursHref = schoolAdminPath(slug, "my_school", "staff_hours");

  return (
    <StaffHoursDashboardTodayContent data={data} staffHoursHref={staffHoursHref} />
  );
}
