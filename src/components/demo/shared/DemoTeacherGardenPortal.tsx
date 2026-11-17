"use client";

import { useMemo, useState } from "react";
import { ParentThemeProvider } from "@/components/school-parent/ParentThemeContext";
import SchoolTeacherHeader from "@/components/school-teacher/SchoolTeacherHeader";
import DemoTeacherAttendancePage from "@/components/demo/shared/DemoTeacherAttendancePage";
import DemoTeacherCalendarPage from "@/components/demo/shared/DemoTeacherCalendarPage";
import DemoTeacherDashboardPage from "@/components/demo/shared/DemoTeacherDashboardPage";
import DemoTeacherFormsDocumentsPage from "@/components/demo/shared/DemoTeacherFormsDocumentsPage";
import DemoTeacherHoursPage from "@/components/demo/shared/DemoTeacherHoursPage";
import DemoTeacherMessagesPage from "@/components/demo/shared/DemoTeacherMessagesPage";
import DemoTeacherMyStudentsPage from "@/components/demo/shared/DemoTeacherMyStudentsPage";
import { applyTeacherDemoRuntime } from "@/components/demo/shared/teacher-demo-runtime";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  DEMO_TEACHER_FEATURES,
  DEMO_TEACHER_USER_PROFILE,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import type { DemoWalkthroughTeacherTab } from "@/data/school-demos/walkthrough-placeholder";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

/** Virtual base for nav hrefs: links resolve to `${BASE}/{feature}` and never navigate. */
const PREVIEW_BASE = "/demo-teacher";

/** Staff portal pages the demo can show, by real feature key. */
const DEMO_PAGES = {
  dashboard: DemoTeacherDashboardPage,
  my_students: DemoTeacherMyStudentsPage,
  messages: DemoTeacherMessagesPage,
  calendar: DemoTeacherCalendarPage,
  attendance: DemoTeacherAttendancePage,
  my_hours: DemoTeacherHoursPage,
  forms_documents: DemoTeacherFormsDocumentsPage,
} as const;
type DemoPageKey = keyof typeof DEMO_PAGES;

/** Walkthrough tab names → real feature keys. */
const TAB_TO_FEATURE: Partial<Record<DemoWalkthroughTeacherTab, DemoPageKey>> = {
  dashboard: "dashboard",
  students: "my_students",
  messages: "messages",
  calendar: "calendar",
  attendance: "attendance",
  hours: "my_hours",
  forms: "forms_documents",
};

/** The nav lists only pages the demo has (no signups, committees or photos). */
const DEMO_GARDEN_TEACHER_FEATURES: OrganizationFeatures = {
  ...DEMO_TEACHER_FEATURES,
  admin: { ...DEMO_TEACHER_FEATURES.admin, photos: false },
  teacher: {
    ...DEMO_TEACHER_FEATURES.teacher,
    classroom_signups: false,
    committees: false,
    feed: false,
    payroll: false,
  },
};

const DEMO_MESSAGES_UNREAD = 2;
const DEMO_ACTIVITY_UNREAD = 3;

function isDemoPageKey(value: string): value is DemoPageKey {
  return value in DEMO_PAGES;
}

/**
 * The real Garden staff portal for the marketing walkthrough: the actual
 * `SchoolTeacherHeader` (embedded: nav switches pages in place) over the real
 * teacher pages in preview mode with demo fixtures. No network, no URL writes.
 */
export default function DemoTeacherGardenPortal({
  config,
  initialTab = "attendance",
}: {
  config: SchoolTeacherDemoConfig;
  initialTab?: DemoWalkthroughTeacherTab;
}) {
  applyTeacherDemoRuntime(config);
  const branding = useMemo(() => buildDemoTeacherBranding(config.accent, config.accentHover), [config]);
  const schoolName = config.logo.alt || resolveDemoSchoolName();
  const [page, setPage] = useState<DemoPageKey>(TAB_TO_FEATURE[initialTab] ?? "attendance");
  const Page = DEMO_PAGES[page];

  const onNavigate = (href: string) => {
    const key = href.slice(PREVIEW_BASE.length + 1).split("/")[0] ?? "";
    if (isDemoPageKey(key)) setPage(key);
  };

  return (
    <ParentThemeProvider branding={branding}>
      <div className="flex h-full min-h-0 flex-col bg-[var(--sf-cream,#f7f1e7)]" data-testid="demo-teacher-garden-portal">
        {/* Account menu links (guides, portal switcher) would leave the walkthrough. */}
        <div className="[&_[data-testid=teacher-header-profile]]:pointer-events-none">
          <SchoolTeacherHeader
            slug={DEMO_PORTAL_SLUG}
            organizationId={DEMO_PORTAL_ORG_ID}
            schoolName={schoolName}
            branding={branding}
            features={DEMO_GARDEN_TEACHER_FEATURES}
            userProfile={DEMO_TEACHER_USER_PROFILE}
            previewMode
            previewBasePath={PREVIEW_BASE}
            activityUnreadCount={DEMO_ACTIVITY_UNREAD}
            initialMessagesUnreadCount={DEMO_MESSAGES_UNREAD}
            embeddedPreview={{ pathname: `${PREVIEW_BASE}/${page}`, onNavigate }}
          />
        </div>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Page key={page} />
        </main>
      </div>
    </ParentThemeProvider>
  );
}
