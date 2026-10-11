"use client";

import { useEffect, useMemo, useRef } from "react";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import MarketingApplySubmittedConfettiOverlay from "@/components/admin/marketing/screens/marketing-apply-submitted-confetti-overlay";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";
import { buildShowcaseApplyDashboardData } from "@/data/school-demos/demo-showcase-fixtures";
import { PARENT_DEMO_STORY_THEME } from "@/components/demo/shared/parent-demo-runtime";
import {
  buildDemoMarketingApplyDashboardData,
  buildDemoMarketingEnrollingApplyDashboardData,
  DEMO_MARKETING_APPLY_APPLICATION_ID,
} from "@/data/school-demos/demo-parent-portal-fixtures";
import {
  buildDemoParentBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import { fireCelebrationConfetti } from "@/lib/celebration-confetti";

export default function DemoParentApplyDashboardPage({
  celebrateSubmission = false,
  story = "submitted",
  suppressHelpFab = false,
}: {
  celebrateSubmission?: boolean;
  story?: "submitted" | "enrolling";
  suppressHelpFab?: boolean;
} = {}) {
  const showcaseEmbed = useShowcaseDesktopEmbed();
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = useMemo(() => resolveDemoSchoolName(), []);
  const showCelebration = story === "submitted" && celebrateSubmission;
  const dashboardData = useMemo(() => {
    if (showcaseEmbed && story === "submitted") {
      return buildShowcaseApplyDashboardData();
    }
    return story === "enrolling"
      ? buildDemoMarketingEnrollingApplyDashboardData()
      : buildDemoMarketingApplyDashboardData();
  }, [showcaseEmbed, story]);
  const celebrationFiredRef = useRef(false);

  useEffect(() => {
    if (!showCelebration || celebrationFiredRef.current) return;
    celebrationFiredRef.current = true;
    fireCelebrationConfetti(PARENT_DEMO_STORY_THEME.primary);
  }, [showCelebration]);

  return (
    <DemoSchoolParentStoryProvider
      className={`flex flex-col ${showcaseEmbed ? "h-auto" : "h-full min-h-0"}`}
    >
      <div
        className={`pointer-events-none relative select-none ${showcaseEmbed ? "overflow-visible" : "h-full min-h-0 overflow-hidden"}`}
        style={{ backgroundColor: branding.colors.bg }}
      >
        <ApplyDashboard
          branding={branding}
          schoolName={schoolName}
          schoolSlug={DEMO_PORTAL_SLUG}
          organizationId={DEMO_PORTAL_ORG_ID}
          timezone="America/Chicago"
          applications={dashboardData.applications}
          applicationsWithTasks={dashboardData.applicationsWithTasks}
          hasEnrolledAccess={false}
          parentPortalEnabled={false}
          enrollmentProgressByApplicationId={dashboardData.enrollmentProgressByApplicationId}
          userProfile={dashboardData.userProfile}
          previewMode
          focusApplicationId={DEMO_MARKETING_APPLY_APPLICATION_ID}
          suppressHelpFab={suppressHelpFab}
        />
        {showCelebration ? <MarketingApplySubmittedConfettiOverlay /> : null}
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
