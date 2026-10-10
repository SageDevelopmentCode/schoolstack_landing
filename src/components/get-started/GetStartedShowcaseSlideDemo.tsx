"use client";

import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import {
  MARKETING_DEMO_APPLY_FLOW_SELECTION,
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingAdmissionsSubmissionsDemoWindow,
  MarketingEnrollmentFlowsDemoWindow,
  MarketingParentEnrollmentDemoWindow,
  MarketingScheduleToursDemoWindow,
  MarketingStudentsDemoWindow,
  MarketingTuitionDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import {
  LazyAdminDashboardDemo,
  LazyParentDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyWebsiteDashboardDemo,
} from "@/components/sections/lazyDemos";
import { buildShowcaseAdmissionsInboxLeads } from "@/data/school-demos/demo-showcase-fixtures";
import type { GetStartedShowcaseDemoConfig } from "@/lib/marketing/get-started-showcase-slides";

type GetStartedShowcaseSlideDemoProps = {
  demo: GetStartedShowcaseDemoConfig;
};

export default function GetStartedShowcaseSlideDemo({
  demo,
}: GetStartedShowcaseSlideDemoProps) {
  const contentHeight = demo.contentHeight;

  return (
    <InViewDemoGate>
      {demo.kind === "productPreview" && (
        <>
          {demo.tabId === "admin" && <LazyAdminDashboardDemo disableTour />}
          {demo.tabId === "website" && <LazyWebsiteDashboardDemo disableTour />}
          {demo.tabId === "enrollment" && (
            <LazyParentDashboardDemo
              initialTab="enrollment"
              disableTour
              hideNav
            />
          )}
          {demo.tabId === "parents" && (
            <LazyParentDashboardDemo initialTab="billing" disableTour hideNav />
          )}
          {demo.tabId === "teachers" && (
            <LazyTeacherDashboardDemo
              initialTab="attendance"
              disableTour
              hideNav
            />
          )}
          {demo.tabId === "marketing" && (
            <LazyAdminDashboardDemo
              initialPage="marketing"
              disableTour
              hideNav
            />
          )}
          {demo.tabId === "timeclock" && (
            <LazyTeacherDashboardDemo initialTab="hours" disableTour hideNav />
          )}
        </>
      )}

      {demo.kind === "marketing" && (
        <>
          {demo.variant === "enrollmentApplication" && (
            <MarketingEnrollmentFlowsDemoWindow
              initialFlowSelection={MARKETING_DEMO_APPLY_FLOW_SELECTION}
              contentHeight={contentHeight}
            />
          )}
          {demo.variant === "scheduleTours" && (
            <MarketingScheduleToursDemoWindow contentHeight={contentHeight} />
          )}
          {demo.variant === "admissionsInbox" && (
            <MarketingAdmissionsSubmissionsDemoWindow
              leads={buildShowcaseAdmissionsInboxLeads()}
              contentHeight={contentHeight}
            />
          )}
          {demo.variant === "enrollmentChecklist" && (
            <MarketingEnrollmentFlowsDemoWindow
              initialFlowSelection={MARKETING_DEMO_CHECKLIST_FLOW_SELECTION}
              contentHeight={contentHeight}
            />
          )}
          {demo.variant === "parentEnrollment" && (
            <MarketingParentEnrollmentDemoWindow
              contentHeight={contentHeight}
            />
          )}
          {demo.variant === "tuitionAdmin" && (
            <MarketingTuitionDemoWindow contentHeight={contentHeight} />
          )}
          {demo.variant === "studentsRoster" && (
            <MarketingStudentsDemoWindow contentHeight={contentHeight} />
          )}
        </>
      )}
    </InViewDemoGate>
  );
}
