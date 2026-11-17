"use client";

/**
 * Marketing Studio windows for the current Garden product look — the same components the home page's
 * DemoStage renders (src/components/home/DemoStage.tsx), on the shared Luff Learning demo fixtures.
 * Each window is a fixed 1100px canvas (CAROUSEL_DEMO_INNER_WIDTH) wrapped in GardenRoot so the Garden
 * fonts and --sf-* tokens resolve inside the Studio.
 */
import type { ReactNode } from "react";
import GardenRoot from "@/components/garden/GardenRoot";
import { CAROUSEL_DEMO_INNER_WIDTH } from "@/components/admin/marketing/carousels/carousel-product-slide";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import ParentDashboardDemo from "@/components/sections/ParentDashboardDemo";
import TeacherDashboardDemo from "@/components/sections/TeacherDashboardDemo";
import DemoAdminGardenDashboard from "@/components/demo/shared/DemoAdminGardenDashboard";
import DemoAdminGardenAdmissions from "@/components/demo/shared/DemoAdminGardenAdmissions";
import DemoAdminGardenMarketing from "@/components/demo/shared/marketing-garden/DemoAdminGardenMarketing";
import DemoParentApplyDashboardPage from "@/components/demo/shared/DemoParentApplyDashboardPage";
import DemoParentEnrollmentChecklist from "@/components/demo/shared/DemoParentEnrollmentChecklist";
import DemoParentCalendarPage from "@/components/demo/shared/DemoParentCalendarPage";
import DemoTeacherHoursPage from "@/components/demo/shared/DemoTeacherHoursPage";
import DemoTeacherFormsDocumentsPage from "@/components/demo/shared/DemoTeacherFormsDocumentsPage";
import DemoTeacherMessagesPage from "@/components/demo/shared/DemoTeacherMessagesPage";
import { luffLearningAdminDemoConfig } from "@/data/school-demos/luff-learning-admin-demo";
import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";

function GardenCanvas({ children, contentHeight }: { children: ReactNode; contentHeight: number }) {
  return (
    <GardenRoot>
      <div
        style={{
          width: CAROUSEL_DEMO_INNER_WIDTH,
          height: contentHeight,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "var(--sf-cream, #F7F1E7)",
        }}
      >
        {children}
      </div>
    </GardenRoot>
  );
}

type WindowProps = { contentHeight?: number };

export function GardenWebsiteWindow({ contentHeight = 920, toForm = false }: WindowProps & { toForm?: boolean }) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <WebsiteDashboardDemo disableTour scrollRequest={toForm ? { target: "form", nonce: 1 } : null} />
    </GardenCanvas>
  );
}

export function GardenAdminDashboardWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoAdminGardenDashboard config={luffLearningAdminDemoConfig} />
    </GardenCanvas>
  );
}

export function GardenAdmissionsWindow({ contentHeight = 920, selectedLeadId }: WindowProps & { selectedLeadId?: string }) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoAdminGardenAdmissions config={luffLearningAdminDemoConfig} initialSelectedLeadId={selectedLeadId} />
    </GardenCanvas>
  );
}

export function GardenMarketingWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoAdminGardenMarketing config={luffLearningAdminDemoConfig} />
    </GardenCanvas>
  );
}

export function GardenParentBillingWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <ParentDashboardDemo initialTab="billing" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenParentHomeWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <ParentDashboardDemo initialTab="home" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenParentApplyWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoParentApplyDashboardPage story="submitted" celebrateSubmission={false} suppressHelpFab />
    </GardenCanvas>
  );
}

export function GardenEnrollmentChecklistWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoParentEnrollmentChecklist config={luffLearningParentDemoConfig} />
    </GardenCanvas>
  );
}

export function GardenParentCalendarWindow({ contentHeight = 920, view = "month" }: WindowProps & { view?: "month" | "week" }) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      {/* Demo events live around spring 2026 (same anchor as the older calendar window). */}
      <DemoParentCalendarPage initialView={view} previewAnchorDate="2026-05-01" previewAgendaAsOf="2026-04-01" />
    </GardenCanvas>
  );
}

export function GardenAttendanceWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <TeacherDashboardDemo initialTab="attendance" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenMessagesWindow({ contentHeight = 920, threadId }: WindowProps & { threadId?: string }) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      {threadId ? (
        <DemoTeacherMessagesPage initialThreadId={threadId} fillHeight />
      ) : (
        <TeacherDashboardDemo initialTab="messages" disableTour hideNav />
      )}
    </GardenCanvas>
  );
}

export function GardenHoursWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", overflow: "hidden" }}>
        <DemoTeacherHoursPage />
      </div>
    </GardenCanvas>
  );
}

export function GardenTeacherFormsWindow({ contentHeight = 920 }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight}>
      <DemoTeacherFormsDocumentsPage />
    </GardenCanvas>
  );
}
