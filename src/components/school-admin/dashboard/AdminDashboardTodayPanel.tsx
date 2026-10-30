"use client";

import { DASHBOARD_TAB_ROOT_CLASS } from "@/components/school-admin/dashboard/dashboard-panel-layout";
import AdminDashboardAttendanceSection from "@/components/school-admin/AdminDashboardAttendanceSection";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminFocusQueue from "@/components/school-admin/ui/story/AdminFocusQueue";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminSignalCard from "@/components/school-admin/ui/story/AdminSignalCard";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import type { AdminDashboardToday } from "@/lib/school-admin/dashboard-summary";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

type AdminDashboardTodayPanelProps = {
  theme: ParentThemeTokens;
  C: ReturnType<typeof parentThemeToAdminCompat>;
  organizationId: string;
  slug: string;
  features: OrganizationFeatures;
  today: AdminDashboardToday;
  onTodayChange: (next: AdminDashboardToday) => void;
};

export default function AdminDashboardTodayPanel({
  theme,
  C,
  organizationId,
  slug,
  features,
  today,
  onTodayChange,
}: AdminDashboardTodayPanelProps) {
  return (
    <div className={DASHBOARD_TAB_ROOT_CLASS}>
      {!today.setupComplete ? (
        <div className="mb-5 max-w-md">
          <DetailPanelProgressBar
            C={C}
            completed={today.setupStatus.completedCount}
            total={today.setupStatus.totalCount}
            label="Setup progress"
            subtitle={`${today.setupStatus.totalCount - today.setupStatus.completedCount} step${
              today.setupStatus.totalCount - today.setupStatus.completedCount === 1
                ? ""
                : "s"
            } remaining before go-live`}
          />
        </div>
      ) : null}

      <div className="mb-[19px] grid grid-cols-1 gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <AdminCard
          theme={theme}
          padding="canvas"
          className="today-card bg-gradient-to-br from-[#FFFDF8] to-[#EEF7EF]"
        >
          <AdminFocusQueue theme={theme} items={today.focusItems} />
        </AdminCard>
        {today.signal ? (
          <AdminSignalCard
            theme={theme}
            headline={today.signal.headline}
            body={today.signal.body}
            href={today.signal.href}
            ctaLabel={today.signal.ctaLabel}
          />
        ) : (
          <AdminCard theme={theme} padding="canvas">
            <AdminSectionKicker theme={theme}>School signal</AdminSectionKicker>
            <p className="mt-3 text-sm" style={{ color: theme.muted }}>
              Activity will appear here as families apply and enroll.
            </p>
          </AdminCard>
        )}
      </div>

      {today.metrics.length > 0 ? (
        <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
          {today.metrics.map((metric) => (
            <AdminMetricCard
              key={metric.id}
              theme={theme}
              value={metric.value}
              label={metric.label}
              accent={metric.accent}
            />
          ))}
        </div>
      ) : null}

      {features.admin?.my_school && today.attendanceToday ? (
        <div className="mb-[19px]">
          <AdminCard theme={theme} padding="canvas">
            <AdminDashboardAttendanceSection
              organizationId={organizationId}
              slug={slug}
              date={today.attendanceToday.date}
              students={today.attendanceToday.students}
              summary={today.attendanceToday.summary}
              onSummaryChange={(nextSummary) => {
                onTodayChange({
                  ...today,
                  attendanceToday: today.attendanceToday
                    ? {
                        ...today.attendanceToday,
                        summary: nextSummary,
                      }
                    : null,
                });
              }}
            />
          </AdminCard>
        </div>
      ) : null}
    </div>
  );
}
