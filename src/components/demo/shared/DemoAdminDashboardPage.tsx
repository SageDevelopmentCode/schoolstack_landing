"use client";

import { useMemo } from "react";
import { ADMIN_DEMO_COPY } from "@/components/demo/shared/admin-demo-runtime";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import AdminDashboardHeader from "@/components/school-admin/AdminDashboardHeader";
import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import { DashboardAttendanceSectionContent } from "@/components/school-admin/attendance/DashboardAttendanceSection";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminActivityFeed from "@/components/school-admin/ui/story/AdminActivityFeed";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminFeatureAnnouncementsCard from "@/components/school-admin/ui/story/AdminFeatureAnnouncementsCard";
import AdminFocusQueue from "@/components/school-admin/ui/story/AdminFocusQueue";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminQuickActionsCard from "@/components/school-admin/ui/story/AdminQuickActionsCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminSignalCard from "@/components/school-admin/ui/story/AdminSignalCard";
import type { SchoolAdminDemoCopy } from "@/data/school-demos/demo-dashboard-types";
import {
  buildDemoAdminDashboardSummary,
  DEMO_ADMIN_ORG_ID,
  DEMO_ADMIN_SLUG,
} from "@/data/school-demos/demo-admin-dashboard-summary";

type DemoAdminDashboardPageProps = {
  copy?: Partial<SchoolAdminDemoCopy>;
};

function DemoAdminDashboardContent({ copy }: DemoAdminDashboardPageProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const resolvedCopy = { ...ADMIN_DEMO_COPY, ...copy };
  const summary = useMemo(
    () => buildDemoAdminDashboardSummary(resolvedCopy),
    [
      copy,
      ADMIN_DEMO_COPY.schoolName,
      ADMIN_DEMO_COPY.schoolShortName,
      ADMIN_DEMO_COPY.officeName,
      ADMIN_DEMO_COPY.locationSubtitle,
    ],
  );

  return (
    <div className="pointer-events-none select-none">
      <AdminDashboardHeader
        slug={DEMO_ADMIN_SLUG}
        schoolName={resolvedCopy.schoolName}
        userFirstName="Admin"
      />

      <div className="mb-[19px] grid grid-cols-1 gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <AdminCard
          theme={theme}
          padding="canvas"
          className="today-card bg-gradient-to-br from-[#FFFDF8] to-[#EEF7EF]"
        >
          <AdminFocusQueue theme={theme} items={summary.focusItems} />
        </AdminCard>
        {summary.signal ? (
          <AdminSignalCard
            theme={theme}
            headline={summary.signal.headline}
            body={summary.signal.body}
            href={summary.signal.href}
            ctaLabel={summary.signal.ctaLabel}
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

      {summary.metrics.length > 0 ? (
        <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
          {summary.metrics.map((metric) => (
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

      {summary.attendanceToday ? (
        <div className="mb-[19px]">
          <AdminCard theme={theme} padding="canvas">
            <AttendanceApiProvider apiBasePath="/api/school-admin/attendance" previewMode>
              <DashboardAttendanceSectionContent
                organizationId={DEMO_ADMIN_ORG_ID}
                date={summary.attendanceToday.date}
                students={summary.attendanceToday.students}
                summary={summary.attendanceToday.summary}
                attendanceHref="#"
                gridClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
                previewMode
              />
            </AttendanceApiProvider>
          </AdminCard>
        </div>
      ) : null}

      <div className="mb-[19px] grid grid-cols-1 gap-[15px] lg:grid-cols-[1.35fr_0.65fr]">
        <AdminCard theme={theme} padding="none">
          <AdminActivityFeed theme={theme} items={summary.recentActivity} />
        </AdminCard>
        <AdminCard theme={theme} padding="none">
          <AdminQuickActionsCard theme={theme} actions={summary.quickActions} />
        </AdminCard>
      </div>

      {summary.featureAnnouncements.length > 0 ? (
        <div className="mb-[19px]">
          <AdminFeatureAnnouncementsCard
            theme={theme}
            announcements={summary.featureAnnouncements}
            buildLogHref="#"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function DemoAdminDashboardPage({
  copy,
}: DemoAdminDashboardPageProps = {}) {
  return (
    <DemoSchoolAdminStoryProvider>
      <DemoAdminDashboardContent copy={copy} />
    </DemoSchoolAdminStoryProvider>
  );
}
