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
import { luffLearningTeacherDemoConfig } from "@/data/school-demos/luff-learning-teacher-demo";
import { defaultWebsiteDemoConfig } from "@/data/school-demos/default";
import {
  yourSchoolAdminDemoConfig,
  yourSchoolParentDemoConfig,
  yourSchoolTeacherDemoConfig,
  yourSchoolWebsiteDemoConfig,
} from "@/data/school-demos/your-school-demo";
import { applyAdminDemoRuntime } from "@/components/demo/shared/admin-demo-runtime";
import { applyParentDemoRuntime } from "@/components/demo/shared/parent-demo-runtime";
import { applyTeacherDemoRuntime } from "@/components/demo/shared/teacher-demo-runtime";

/**
 * "luff" = the home page's Luff Learning demo; "your-school" = the neutral placeholder brand
 * (src/data/school-demos/your-school-demo.ts) for ads that say "this is what yours looks like".
 */
export type GardenDemoBrand = "luff" | "your-school";

const BRANDS = {
  luff: {
    admin: luffLearningAdminDemoConfig,
    parent: luffLearningParentDemoConfig,
    teacher: luffLearningTeacherDemoConfig,
    website: defaultWebsiteDemoConfig,
  },
  "your-school": {
    admin: yourSchoolAdminDemoConfig,
    parent: yourSchoolParentDemoConfig,
    teacher: yourSchoolTeacherDemoConfig,
    website: yourSchoolWebsiteDemoConfig,
  },
} as const;

function GardenCanvas({ children, contentHeight, brand }: { children: ReactNode; contentHeight: number; brand: GardenDemoBrand }) {
  // Some demo pages read the module-level demo runtime instead of taking a config. Set it for this
  // brand before the children render, so a window never shows the last brand that rendered.
  const configs = BRANDS[brand];
  applyAdminDemoRuntime(configs.admin);
  applyParentDemoRuntime(configs.parent);
  applyTeacherDemoRuntime(configs.teacher);
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

type WindowProps = { contentHeight?: number; brand?: GardenDemoBrand };

export function GardenWebsiteWindow({ contentHeight = 920, brand = "luff", toForm = false }: WindowProps & { toForm?: boolean }) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <WebsiteDashboardDemo config={BRANDS[brand].website} disableTour scrollRequest={toForm ? { target: "form", nonce: 1 } : null} />
    </GardenCanvas>
  );
}

export function GardenAdminDashboardWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoAdminGardenDashboard config={BRANDS[brand].admin} />
    </GardenCanvas>
  );
}

export function GardenAdmissionsWindow({ contentHeight = 920, brand = "luff", selectedLeadId }: WindowProps & { selectedLeadId?: string }) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoAdminGardenAdmissions config={BRANDS[brand].admin} initialSelectedLeadId={selectedLeadId} />
    </GardenCanvas>
  );
}

export function GardenMarketingWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoAdminGardenMarketing config={BRANDS[brand].admin} />
    </GardenCanvas>
  );
}

export function GardenParentBillingWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <ParentDashboardDemo config={BRANDS[brand].parent} initialTab="billing" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenParentHomeWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <ParentDashboardDemo config={BRANDS[brand].parent} initialTab="home" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenParentApplyWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoParentApplyDashboardPage story="submitted" celebrateSubmission={false} suppressHelpFab />
    </GardenCanvas>
  );
}

export function GardenEnrollmentChecklistWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoParentEnrollmentChecklist config={BRANDS[brand].parent} />
    </GardenCanvas>
  );
}

export function GardenParentCalendarWindow({ contentHeight = 920, brand = "luff", view = "month" }: WindowProps & { view?: "month" | "week" }) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      {/* Demo events live around spring 2026 (same anchor as the older calendar window). */}
      <DemoParentCalendarPage initialView={view} previewAnchorDate="2026-05-01" previewAgendaAsOf="2026-04-01" />
    </GardenCanvas>
  );
}

export function GardenTeacherHomeWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <TeacherDashboardDemo config={BRANDS[brand].teacher} initialTab="dashboard" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenAttendanceWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <TeacherDashboardDemo config={BRANDS[brand].teacher} initialTab="attendance" disableTour hideNav />
    </GardenCanvas>
  );
}

export function GardenMessagesWindow({ contentHeight = 920, brand = "luff", threadId }: WindowProps & { threadId?: string }) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      {threadId ? (
        <DemoTeacherMessagesPage initialThreadId={threadId} fillHeight />
      ) : (
        <TeacherDashboardDemo config={BRANDS[brand].teacher} initialTab="messages" disableTour hideNav />
      )}
    </GardenCanvas>
  );
}

export function GardenHoursWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", overflow: "hidden" }}>
        <DemoTeacherHoursPage />
      </div>
    </GardenCanvas>
  );
}

export function GardenTeacherFormsWindow({ contentHeight = 920, brand = "luff" }: WindowProps) {
  return (
    <GardenCanvas contentHeight={contentHeight} brand={brand}>
      <DemoTeacherFormsDocumentsPage openFormId={null} />
    </GardenCanvas>
  );
}
