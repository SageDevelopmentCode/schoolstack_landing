"use client";

import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import SchoolAdminSummaryCardsSkeleton from "@/components/school-admin/skeletons/SchoolAdminSummaryCardsSkeleton";

export default function AdminDashboardContentSkeleton() {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-5 max-w-md">
        <SkeletonBlock C={C} className="mb-2 h-3 w-28" />
        <SkeletonBlock C={C} className="h-2 w-full rounded-full" />
      </div>

      <div className="mb-[19px] grid grid-cols-1 gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <AdminCard theme={theme} padding="canvas">
          <SkeletonBlock C={C} className="mb-3 h-3 w-24" />
          <SkeletonBlock C={C} className="mb-2 h-12 w-full" />
          <SkeletonBlock C={C} className="mb-2 h-12 w-full" />
          <SkeletonBlock C={C} className="h-12 w-3/4" />
        </AdminCard>
        <AdminCard theme={theme} padding="canvas">
          <SkeletonBlock C={C} className="mb-3 h-3 w-24" />
          <SkeletonBlock C={C} className="mb-2 h-4 w-full" />
          <SkeletonBlock C={C} className="h-4 w-2/3" />
        </AdminCard>
      </div>

      <AdminCard theme={theme} padding="none" className="mb-[19px]">
        <SchoolAdminSummaryCardsSkeleton C={C} count={4} />
      </AdminCard>

      <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-[1.35fr_0.65fr]">
        <AdminCard theme={theme} padding="canvas">
          <SkeletonBlock C={C} className="mb-3 h-3 w-28" />
          <SkeletonBlock C={C} className="mb-2 h-10 w-full" />
          <SkeletonBlock C={C} className="mb-2 h-10 w-full" />
          <SkeletonBlock C={C} className="h-10 w-full" />
        </AdminCard>
        <AdminCard theme={theme} padding="canvas">
          <SkeletonBlock C={C} className="mb-3 h-3 w-28" />
          <SkeletonBlock C={C} className="mb-2 h-12 w-full" />
          <SkeletonBlock C={C} className="h-12 w-full" />
        </AdminCard>
      </div>
    </div>
  );
}
