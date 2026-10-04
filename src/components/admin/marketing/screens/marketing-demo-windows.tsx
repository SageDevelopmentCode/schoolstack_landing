"use client";

import DemoAdminStudentsPage from "@/components/demo/shared/DemoAdminStudentsPage";
import DemoAdminTuitionPage from "@/components/demo/shared/DemoAdminTuitionPage";
import ParentDashboardDemo from "@/components/sections/ParentDashboardDemo";
import { TuitionPaymentOptionsScreen } from "@/components/admin/marketing/screens/tuition-screens";
import type { TuitionDashboardTabId } from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import { CAROUSEL_DEMO_INNER_WIDTH } from "@/components/admin/marketing/carousels/carousel-product-slide";

function DemoCanvas({ children, minHeight }: { children: React.ReactNode; minHeight: number }) {
  return (
    <div
      style={{
        width: CAROUSEL_DEMO_INNER_WIDTH,
        minHeight,
        height: minHeight,
        background: "#F8F8F3",
      }}
    >
      {children}
    </div>
  );
}

export function MarketingStudentsDemoWindow({ contentHeight = 920 }: { contentHeight?: number }) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminStudentsPage />
    </DemoCanvas>
  );
}

export function MarketingParentDemoWindow({
  tab,
  hideNav = true,
  contentHeight = 700,
}: {
  tab: "home" | "enrollment" | "billing";
  hideNav?: boolean;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <ParentDashboardDemo initialTab={tab} disableTour hideNav={hideNav} />
    </DemoCanvas>
  );
}

export function MarketingTuitionDemoWindow({
  initialDashboardTab = "catalog",
  contentHeight = 920,
}: {
  initialDashboardTab?: TuitionDashboardTabId;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminTuitionPage initialDashboardTab={initialDashboardTab} />
    </DemoCanvas>
  );
}

export function MarketingTuitionOptionsWindow({ contentHeight = 720 }: { contentHeight?: number }) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <div style={{ height: "100%", minHeight: contentHeight }}>
        <TuitionPaymentOptionsScreen />
      </div>
    </DemoCanvas>
  );
}
