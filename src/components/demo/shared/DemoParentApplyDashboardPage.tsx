"use client";

import { useEffect, useMemo, useRef } from "react";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import MarketingApplySubmittedConfettiOverlay from "@/components/admin/marketing/screens/marketing-apply-submitted-confetti-overlay";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
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
}: {
  celebrateSubmission?: boolean;
  story?: "submitted" | "enrolling";
} = {}) {
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = useMemo(() => resolveDemoSchoolName(), []);
  const showCelebration = story === "submitted" && celebrateSubmission;
  const dashboardData = useMemo(
    () =>
      story === "enrolling"
        ? buildDemoMarketingEnrollingApplyDashboardData()
        : buildDemoMarketingApplyDashboardData(),
    [story],
  );
  const celebrationFiredRef = useRef(false);

  useEffect(() => {
    if (!showCelebration || celebrationFiredRef.current) return;
    celebrationFiredRef.current = true;
    fireCelebrationConfetti(PARENT_DEMO_STORY_THEME.primary);
  }, [showCelebration]);

  return (
    <DemoSchoolParentStoryProvider className="flex h-full min-h-0 flex-col">
      <div
        className="pointer-events-none relative h-full min-h-0 select-none overflow-hidden"
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
        />
        {showCelebration ? <MarketingApplySubmittedConfettiOverlay /> : null}
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
