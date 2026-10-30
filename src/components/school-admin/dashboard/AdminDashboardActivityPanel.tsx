"use client";

import {
  DASHBOARD_TAB_ROOT_CLASS,
  DASHBOARD_TWO_COLUMN_CLASS,
} from "@/components/school-admin/dashboard/dashboard-panel-layout";
import AdminActivityFeed from "@/components/school-admin/ui/story/AdminActivityFeed";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminQuickActionsCard from "@/components/school-admin/ui/story/AdminQuickActionsCard";
import type { AdminDashboardActivity } from "@/lib/school-admin/dashboard-summary";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminDashboardActivityPanelProps = {
  theme: ParentThemeTokens;
  activity: AdminDashboardActivity;
  onViewAllActivity: () => void;
};

export default function AdminDashboardActivityPanel({
  theme,
  activity,
  onViewAllActivity,
}: AdminDashboardActivityPanelProps) {
  return (
    <div className={`${DASHBOARD_TAB_ROOT_CLASS} ${DASHBOARD_TWO_COLUMN_CLASS} mb-[19px]`}>
      <AdminCard theme={theme} padding="none">
        <AdminActivityFeed
          theme={theme}
          items={activity.recentActivity}
          onViewAll={onViewAllActivity}
        />
      </AdminCard>
      {activity.quickActions.length > 0 ? (
        <AdminCard theme={theme} padding="none">
          <AdminQuickActionsCard theme={theme} actions={activity.quickActions} />
        </AdminCard>
      ) : null}
    </div>
  );
}
