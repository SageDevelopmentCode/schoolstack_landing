"use client";

import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";

export default function ApplicationSubmissionsTableSkeleton() {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <AdminCard theme={theme} padding="none" className="overflow-hidden">
      <SchoolAdminTableSkeleton
        C={C}
        rows={8}
        columns={7}
        showFilters={false}
        label="Loading submissions table"
      />
    </AdminCard>
  );
}
