import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ReactNode } from "react";

const TABLE_LINE = "#EDF1ED";

function StaffHoursSectionCard({
  theme,
  title,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  children: ReactNode;
}) {
  return (
    <AdminCard theme={theme} padding="none" className="overflow-hidden">
      <div className="border-b px-5 py-4" style={{ borderColor: TABLE_LINE }}>
        <h2 className="font-display text-lg font-semibold" style={{ color: theme.ink }}>
          {title}
        </h2>
      </div>
      {children}
    </AdminCard>
  );
}

type StaffHoursLiveLoadingSkeletonProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

export function StaffHoursLiveLoadingSkeleton({ theme, C }: StaffHoursLiveLoadingSkeletonProps) {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      data-testid="admin-staff-hours-loading-live"
    >
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading staff hours metrics"
      >
        {[0, 1].map((index) => (
          <div
            key={index}
            className="rounded-[15px] border bg-white p-[15px]"
            style={{ borderColor: "#E0E7E0" }}
          >
            <SkeletonBlock C={C} className="mb-2 h-3 w-28" />
            <SkeletonBlock C={C} className="h-8 w-14" />
          </div>
        ))}
      </div>

      <StaffHoursSectionCard theme={theme} title="Active sessions">
        <SchoolAdminTableSkeleton
          C={C}
          rows={5}
          columns={4}
          showFilters={false}
          label="Loading active sessions"
        />
      </StaffHoursSectionCard>

      <StaffHoursSectionCard theme={theme} title="Today's completed sessions">
        <SchoolAdminTableSkeleton
          C={C}
          rows={4}
          columns={4}
          showFilters={false}
          label="Loading today's sessions"
        />
      </StaffHoursSectionCard>
    </div>
  );
}

type StaffHoursSummaryTableLoadingSkeletonProps = {
  C: AdminThemeTokens;
};

export function StaffHoursSummaryTableLoadingSkeleton({
  C,
}: StaffHoursSummaryTableLoadingSkeletonProps) {
  return (
    <div aria-busy="true" data-testid="admin-staff-hours-loading-summary">
      <SchoolAdminTableSkeleton
        C={C}
        rows={6}
        columns={6}
        showFilters={false}
        label="Loading staff hours summary"
      />
    </div>
  );
}
