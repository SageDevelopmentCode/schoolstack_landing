"use client";

import { useCallback, useEffect, useState } from "react";
import AdminActivityFeed from "@/components/school-admin/ui/story/AdminActivityFeed";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminFocusQueue from "@/components/school-admin/ui/story/AdminFocusQueue";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminQuickActionsCard from "@/components/school-admin/ui/story/AdminQuickActionsCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminSignalCard from "@/components/school-admin/ui/story/AdminSignalCard";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { AdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
import { useAdminNotificationsPanel } from "@/lib/school-admin/admin-notifications-panel-context";
import { useVisibilityPolling } from "@/lib/hooks/use-visibility-polling";

type AdminDashboardContentProps = {
  organizationId: string;
  slug: string;
  initialSummary: AdminDashboardSummary;
};

export default function AdminDashboardContent({
  organizationId,
  slug,
  initialSummary,
}: AdminDashboardContentProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const { openNotifications } = useAdminNotificationsPanel();
  const [summary, setSummary] = useState(initialSummary);
  const [prevInitialSummary, setPrevInitialSummary] = useState(initialSummary);

  if (initialSummary !== prevInitialSummary) {
    setPrevInitialSummary(initialSummary);
    setSummary(initialSummary);
  }

  const refreshSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams({ organizationId, slug });
      const response = await fetch(
        `/api/school-admin/dashboard-summary?${params.toString()}`,
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardSummary;
      setSummary(next);
    } catch {
      // Keep last known summary on refresh failure.
    }
  }, [organizationId, slug]);

  useEffect(() => {
    const onFocus = () => {
      void refreshSummary();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshSummary]);

  const stripeStep = summary.setupStatus.steps.find((step) => step.id === "stripe");
  const pollStripe = useCallback(async () => {
    try {
      await fetch("/api/stripe/connect/status");
      await refreshSummary();
    } catch {
      // Ignore polling errors.
    }
  }, [refreshSummary]);

  useVisibilityPolling(
    pollStripe,
    60_000,
    stripeStep?.status === "in_progress",
  );

  return (
    <>
      {!summary.setupComplete ? (
        <div className="mb-5 max-w-md">
          <DetailPanelProgressBar
            C={C}
            completed={summary.setupStatus.completedCount}
            total={summary.setupStatus.totalCount}
            label="Setup progress"
            subtitle={`${summary.setupStatus.totalCount - summary.setupStatus.completedCount} step${
              summary.setupStatus.totalCount - summary.setupStatus.completedCount === 1
                ? ""
                : "s"
            } remaining before go-live`}
          />
        </div>
      ) : null}

      <div className="mb-[19px] grid grid-cols-1 gap-[15px] lg:grid-cols-[1.3fr_0.7fr]">
        <AdminCard theme={theme} padding="canvas" className="today-card bg-gradient-to-br from-[#FFFDF8] to-[#EEF7EF]">
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

      <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-[1.35fr_0.65fr]">
        <AdminCard theme={theme} padding="none">
          <AdminActivityFeed
            theme={theme}
            items={summary.recentActivity}
            onViewAll={openNotifications}
          />
        </AdminCard>
        <AdminCard theme={theme} padding="none">
          <AdminQuickActionsCard theme={theme} actions={summary.quickActions} />
        </AdminCard>
      </div>
    </>
  );
}
