"use client";

import Link from "next/link";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { greetingParts } from "@/lib/school-admin/dashboard-summary";

type AdminDashboardHeaderProps = {
  slug: string;
  schoolName: string;
  userFirstName?: string | null;
};

export default function AdminDashboardHeader({
  slug,
  schoolName,
  userFirstName,
}: AdminDashboardHeaderProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const greetingName = userFirstName?.trim() || "there";
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const admissionsHref = schoolAdminPath(slug, "admissions", "submissions");

  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
      <div>
        <AdminSectionKicker theme={theme}>School workspace</AdminSectionKicker>
        <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
          {greetingPrefix}, {greetingName}.{" "}
          <span aria-hidden="true">{greetingEmoji}</span>
        </AdminDisplayHeading>
        <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
          Here is {schoolName}&apos;s operating picture for {dayName}.
        </p>
      </div>
      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
        <ParentDatePill theme={theme} />
        <Link href={admissionsHref}>
          <AdminButton theme={theme} variant="primary">
            Review admissions →
          </AdminButton>
        </Link>
      </div>
    </div>
  );
}
