"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AdminDocumentationGuidePanel from "@/components/school-admin/AdminDocumentationGuidePanel";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { DashboardAttendanceModel } from "@/components/school-admin/attendance/useDashboardAttendanceModel";
import { DASHBOARD_TABS } from "@/components/school-admin/dashboard/dashboard-tabs";
import {
  useAdminDashboardModel,
  type AdminDashboardModel,
} from "@/components/school-admin/dashboard/useAdminDashboardModel";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { useAdminNotificationsPanel } from "@/lib/school-admin/admin-notifications-panel-context";
import type {
  AdminDashboardSummary,
  AdminDashboardToday,
} from "@/lib/school-admin/dashboard-summary";
import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import AdminGardenDashboardHeader from "./AdminGardenDashboardHeader";
import {
  GardenAttendanceBoard,
  GardenAttendanceSheets,
  showsAttendance,
  useGardenAttendance,
} from "./GardenAttendanceBoard";
import GardenFocusQueue from "./GardenFocusQueue";
import { GardenActivityPanel, GardenGuidesPanel, GardenJourneyPanel } from "./GardenSecondaryPanels";
import {
  GardenMetricTiles,
  GardenSetupProgress,
  GardenSignalCard,
  shouldShowSetup,
} from "./GardenTodayCards";
import GardenStaffHoursCard from "./GardenStaffHoursCard";
import { ADMIN_GARDEN_CONTAINER_CLASS } from "./shared";

export type AdminGardenDashboardProps = {
  organizationId: string;
  slug: string;
  plan: OrganizationPlan;
  features: OrganizationFeatures;
  userFirstName?: string | null;
  schoolName: string;
  /** A full `AdminDashboardSummary` in `previewMode` (Activity + Guides fixtures). */
  initialToday: AdminDashboardToday | AdminDashboardSummary;
  /**
   * Marketing demos only: tabs switch locally, nothing is fetched or saved,
   * and the attendance board is view-only. Real routes never pass it.
   */
  previewMode?: boolean;
};

function noop() {}

/** One-line status under the greeting, built only from today's data. */
function todayStatusLine(model: AdminDashboardModel, features: OrganizationFeatures): string {
  const parts: string[] = [];
  const focus = model.today.focusItems.length;
  parts.push(focus > 0 ? `${focus} item${focus === 1 ? "" : "s"} need you today` : "Nothing urgent today");
  const attendance = model.today.attendanceToday;
  if (features.admin?.my_school && attendance && attendance.summary.totalStudents > 0) {
    const s = attendance.summary;
    parts.push(
      s.notMarkedCount > 0
        ? `${s.notMarkedCount} of ${s.totalStudents} students not marked yet`
        : `${s.presentCount + s.pickedUpCount} of ${s.totalStudents} students present`,
    );
  }
  return parts.join(" · ");
}

/**
 * School admin Dashboard (Garden "Command center"): header + tabs, then the
 * Today panel (focus queue, signal, setup, KPIs, attendance, staff hours) and
 * the Journey / Activity / Guides panels. State lives in
 * `useAdminDashboardModel` and `useDashboardAttendanceModel`.
 * Design rules: `.agents/skills/admin-portal-garden-design/SKILL.md`.
 */
export default function AdminGardenDashboard(props: AdminGardenDashboardProps) {
  // Preview: the attendance model is read-only (no saves) and its sheets read
  // the preview flag, so the whole page shares one AttendanceApiProvider.
  return props.previewMode ? (
    <AttendanceApiProvider previewMode>
      <AdminGardenDashboardPage {...props} />
    </AttendanceApiProvider>
  ) : (
    <AdminGardenDashboardPage {...props} />
  );
}

function AdminGardenDashboardPage(props: AdminGardenDashboardProps) {
  const { organizationId, slug, plan, features, initialToday, userFirstName, previewMode = false } = props;
  const { theme, C } = useSchoolAdminStoryTheme();
  const { openNotifications } = useAdminNotificationsPanel();
  const reduce = useReducedMotion() === true;
  const model = useAdminDashboardModel({
    organizationId,
    slug,
    plan,
    features,
    initialToday,
    previewMode,
  });
  const att = useGardenAttendance({ organizationId, slug, model, previewMode });
  const tabMeta = DASHBOARD_TABS.find((tab) => tab.id === model.activeTab);

  return (
    <>
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <div className={ADMIN_GARDEN_CONTAINER_CLASS}>
          <AdminGardenDashboardHeader
            model={model}
            userFirstName={userFirstName}
            subtitle={todayStatusLine(model, features)}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={model.activeTab}
              id={`dashboard-panel-${model.activeTab}`}
              role="tabpanel"
              aria-label={tabMeta?.panelLabel}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.24, ease: PORTAL_EASE }}
              className="flex min-w-0 flex-col gap-5"
            >
              {model.activeTab === "today" ? (
                <GardenTodayPanel model={model} att={att} theme={theme} props={props} />
              ) : null}
              {model.activeTab === "journey" ? (
                <GardenJourneyPanel sections={model.journeySections} />
              ) : null}
              {model.activeTab === "activity" ? (
                <GardenActivityPanel
                  model={model}
                  // The notifications drawer loads from the API; previews have no feed behind it.
                  onViewAll={previewMode ? noop : openNotifications}
                />
              ) : null}
              {model.activeTab === "guides" ? <GardenGuidesPanel model={model} slug={slug} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </ParentGardenFrame>

      {/* Sheets and drawers stay outside the Garden frame (story-styled). The
          attendance sheets load history / pickup contacts, so previews skip them. */}
      {previewMode ? null : (
        <GardenAttendanceSheets att={att} organizationId={organizationId} theme={theme} C={C} />
      )}
      <AdminDocumentationGuidePanel
        C={C}
        guide={model.activeGuide}
        open={model.activeGuide != null}
        onClose={model.closeGuide}
      />
    </>
  );
}

/** Today: focus queue + signal/setup rail above the fold, KPIs, roster, staff hours. */
function GardenTodayPanel({
  model,
  att,
  theme,
  props,
}: {
  model: AdminDashboardModel;
  att: DashboardAttendanceModel;
  theme: ParentThemeTokens;
  props: AdminGardenDashboardProps;
}) {
  const { today } = model;
  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <GardenFocusQueue theme={theme} items={today.focusItems} />
        <div className="flex flex-col gap-5">
          <GardenSignalCard today={today} plan={props.plan} />
          {shouldShowSetup(props.plan, today) ? (
            <GardenSetupProgress today={today} stripeChecking={model.stripeChecking} compact index={3} />
          ) : null}
        </div>
      </div>
      <GardenMetricTiles slug={props.slug} metrics={today.metrics} />
      {showsAttendance(props.features, model) ? (
        props.previewMode ? (
          // View-only in previews: date stepping and row sheets would fetch.
          <div inert>
            <GardenAttendanceBoard att={att} layout="table" />
          </div>
        ) : (
          <GardenAttendanceBoard att={att} layout="table" />
        )
      ) : null}
      <GardenStaffHoursCard slug={props.slug} today={today} />
    </>
  );
}
