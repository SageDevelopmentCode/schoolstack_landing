"use client";

import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { greetingParts } from "@/lib/school-admin/dashboard-summary";

type AdminDashboardHeaderProps = {
  schoolName: string;
  userFirstName?: string | null;
};

export default function AdminDashboardHeader({
  userFirstName,
}: AdminDashboardHeaderProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const greetingName = userFirstName?.trim() || "there";
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
      <div className="min-w-0">
        <AdminSectionKicker theme={theme}>School workspace</AdminSectionKicker>
        <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
          {greetingPrefix}, {greetingName}.{" "}
          <span aria-hidden="true">{greetingEmoji}</span>
        </AdminDisplayHeading>
      </div>
      <ParentDatePill theme={theme} />
    </div>
  );
}
