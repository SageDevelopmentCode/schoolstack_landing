---
name: admin-workspace-design
description: >-
  School Day Story design system for school admin workspace pages. Use when
  redesigning admin pages to match the Rooted Meadows prototype, applying story
  tokens and Admin* UI primitives on the admin shell, sidebar, dashboard, and
  enrollment flows.
---

# Admin Workspace — School Day Story Design

## When to use

- Redesigning **school admin** page content under `src/app/school/[slug]/admin/`
- Matching the Rooted Meadows admin prototype (`rooted-meadows-portal-prototype.html`)
- Applying warm paper canvas, Fraunces headings, and story cards inside the existing admin shell

## Design system

### Tokens

- Reuse `buildParentThemeTokens(branding)` from [`src/lib/organization-settings/parent-theme.ts`](src/lib/organization-settings/parent-theme.ts)
- Bridge unmigrated widgets: `parentThemeToAdminCompat(theme)` → `AdminThemeTokens`
- Admin density: **16px** card radius (`ADMIN_RADIUS_CARD`), tighter gaps than parent portal

### UI primitives (`src/components/school-admin/ui/story/`)

| Component | Use for |
|-----------|---------|
| `AdminSectionKicker` | Eyebrow labels above headings |
| `AdminDisplayHeading` | Fraunces page/section/canvas titles |
| `AdminCard` | White bordered surfaces |
| `AdminButton` | Primary, soft, outline, danger CTAs |
| `AdminChip` | Status pills (success, warning, info, purple) |
| `AdminSaveStateBar` | Publish-readiness strip at bottom of builder canvas |
| `AdminTextLink` | Inline text actions (+ Add, Reorder) |
| `AdminMetricCard` | Dashboard metric with accent bar |
| `AdminFocusQueue` | Today's focus priority list |
| `AdminSignalCard` | Dark forest enrollment signal panel |
| `AdminActivityFeed` | Recent activity feed |
| `AdminQuickActionsCard` | Dashboard quick-action rail |
| `AdminHoverTip` | Hover/focus popup for inline icon explanations |

### Shell components

| Component | Use for |
|-----------|---------|
| `SchoolAdminStoryShell` | Global admin paper canvas, Fraunces + DM Sans, theme context |
| `SchoolAdminStorySidebar` | Left nav: brand, school card, Workspace/Manage groups, sage active nav |
| `EnrollmentFlowsStoryShell` | Nested builder pages (optional; baseline already wraps story shell) |

### Page anatomy

**Dashboard (operations home):**

```
SchoolAdminStoryShell (from SchoolAdminBaseline)
  Greeting + setup progress chip (when incomplete)
  Focus queue | School signal
  Metrics row (4 cards)
  Recent activity | Quick actions
```

**Builder pages (enrollment flows, programs):**

```
EnrollmentFlowsStoryShell (paper bg, Fraunces + DM Sans)
  EnrollmentFlowsStoryHeader (kicker + h1 + subtitle + CTAs)
  Builder grid: outline rail (240px) | paper canvas (#F7F9F7)
    Programs: ProgramsOutline | BuilderQuestionCard form fields + AdminSaveStateBar
    Flows: ApplicationFormOutline | ApplicationFormFocusCanvas
```

**Submissions list (admissions tab):**

```
useSchoolAdminStoryTheme()
  AdminMetricCard row (all · in progress · ready to review · enrolled)
  Sage "Needs attention" banner when a submitted application awaits review
  Filter row: status pills (+ optional form row) | Public apply link right
  AdminCard > prototype-style table (no inner card title row)
    Contact: avatar + guardian + ParentPortalLoginIcon + AdminHoverTip
    Progress: form progress + formatRelativeTime(updatedAt) + draft mini bar
    Next step: deriveSubmissionNextStep → AdminChip or soft AdminButton
```

**Submission detail drawer:**

```
SubmissionDetailStoryProvider variant=story
  Paper drawer (#F8FAF8) + prototype overlay
  Header: Application review kicker, name + AdminChip, meta, soft Close
  Forest underline tabs with lucide icons (Overview · Application form · History · Payments)
  Lazy-mounted tab panels: mount on first visit, keep alive when hidden
  tabPanelVariants fade/slide on tab switch (respect prefers-reduced-motion)
  DetailPanelSectionGroup/DetailPanelSection → AdminCard sections via context
```

**My Students list (my_school tab):**

```
useSchoolAdminStoryTheme()
  AdminMetricCard row (all enrolled · unassigned teacher · programs · new enrollments)
  Sage "Needs attention" banner when students lack teacher assignments
  Filter row: All · Unassigned (+ program pills when multi-program) | search right
  AdminCard > prototype-style table
    Student: StudentIdentityCell (photo + name + family subline)
    Teacher: StudentTeacherCell (subtle amber border on unassigned teacher dropdown only)
    Family: StudentContactCell
    Enrolled: StudentEnrolledCell (relative time + short date)
  StudentDetailPanel drawer: same story shell as submission detail (Overview · Family tabs)
```

**Staff list (my_school tab):**

```
Always-on split-pane (prototype staff directory detail view):
  Add staff in StaffListSidebar card above search (mobile: above horizontal strip)
  grid-cols-[280px_1fr]: StaffListSidebar (left) + StaffDetailPane (right AdminCard)
  Mobile: horizontal staff strip above detail pane (lg+ uses sidebar)
  StaffDetailPane: hero avatar + Edit profile; tabs Profile · Portal access · Learners & groups · Contact
    Lazy-mounted tab cache + tabPanelVariants; profile edit, portal deactivate/reactivate,
    StaffAssignedStudentsSection assign/unassign, contact email read-only
  Auto-select first staff on load; deep link: ?staff={id}
  No table, metrics, filters, or Staff directory back navigation
```

**Schedule (schedule tab):**

```
useSchoolAdminStoryTheme()
  ScheduleStoryHeader: kicker + AdminDisplayHeading + dynamic subtitle + ParentDatePill + ParentStoryPillNav
    pendingTabKey / loadingTabKey → Loader2 suffix on pill while tab data fetches
  ?tab= routing: overview (default) · events · tours · shadow · visits

Overview:
  AdminMetricCard row (open slots · shadow days · upcoming visits) — clickable, navigates to subtab
  2-col grid: AdminCard upcoming agenda (focus-queue rows) | AdminCard school events + quick setup

Events:
  Toolbar on paper canvas (date nav, Week/Month, Add event) — no outer AdminCard
  OrganizationEventsCalendar variant=parent-story loadingBehavior=grid-only (toolbar stays during fetch)
  SchoolEventFormPanel: story paper drawer (#F8FAF8) + AdminSectionKicker + AdminButton footer

Tours / Shadow:
  AdminCard > AdmissionsAvailabilityEditor / AdmissionsObservationDayAvailabilityEditor (storySurface)

All visits:
  StoryFilterPill rows (type + timing) | AdminCard prototype table + AdminChip status
  Row click → ApplicationSubmissionDetailPanel slide-out
```

**Messages (messages tab):**

```
useSchoolAdminStoryTheme()
  MessagesInboxLayout variant="admin-story"
  Always-on split-pane: 340px inbox | paper chat pane (#EFF5F0)
  AdminMessagesInboxHeader: Fraunces title + AdminButton + New + search
  Sectioned inbox list: school office threads · Parent & teacher conversations · Other
  Story row styling: primarySoft active bg, dot unread, avatar-beside-bubble chat
  Admin compose banner for guardian↔staff review threads (info/warning; disabled without staff profile)
  Full-height inside SchoolAdminBaseline (isMessagesPage overflow-hidden)
```

Roster metrics: [`admin-student-roster-metrics.ts`](src/lib/school-admin/admin-student-roster-metrics.ts), [`admin-staff-roster-metrics.ts`](src/lib/school-admin/admin-staff-roster-metrics.ts). Staff display helpers: [`staff-display.ts`](src/lib/staff/staff-display.ts). Assigned learner counts: [`fetchAssignedStudentCountsByStaffIds`](src/lib/school-admin/enrolled-students.ts). Next-step logic: [`admin-submission-next-step.ts`](src/lib/admissions/admin-submission-next-step.ts). Relative time: [`formatRelativeTime`](src/lib/school-admin/activity-notifications.ts). Drawer context: [`SubmissionDetailStoryContext.tsx`](src/components/school-admin/admissions/SubmissionDetailStoryContext.tsx).

### Scope

- **In scope:** `SchoolAdminStoryShell`, `SchoolAdminStorySidebar`, dashboard, page content inside baseline
- **Out of scope (until later):** global top bar (breadcrumb, Export, + Add family)

## Implementation checklist

1. Wrap layout in `SchoolAdminStoryShell` via `SchoolAdminBaseline` (or nested `EnrollmentFlowsStoryShell` for builders)
2. Use `theme` for new story surfaces; `parentThemeToAdminCompat(theme)` for legacy `C` props
3. Preserve `data-testid` hooks and all save/publish business logic
4. Match prototype builder: numbered steps, sage active state, field cards, save-state bar

## Reference

- Enrollment flows: [`ApplicationFormsPage.tsx`](src/components/school-admin/admissions/ApplicationFormsPage.tsx)
- Programs: [`ProgramsPage.tsx`](src/components/school-admin/admissions/ProgramsPage.tsx), [`ProgramsOutline.tsx`](src/components/school-admin/admissions/ProgramsOutline.tsx)
- Submissions: [`ApplicationSubmissionsPage.tsx`](src/components/school-admin/admissions/ApplicationSubmissionsPage.tsx), [`SubmissionNextStepCell.tsx`](src/components/school-admin/admissions/SubmissionNextStepCell.tsx)
- Staff: [`StaffPage.tsx`](src/components/school-admin/staff/StaffPage.tsx), [`StaffDetailPane.tsx`](src/components/school-admin/staff/StaffDetailPane.tsx), [`StaffListSidebar.tsx`](src/components/school-admin/staff/StaffListSidebar.tsx)
- Schedule: [`SchedulePage.tsx`](src/components/school-admin/SchedulePage.tsx), [`ScheduleStoryHeader.tsx`](src/components/school-admin/schedule/ScheduleStoryHeader.tsx), [`ScheduleOverviewTab.tsx`](src/components/school-admin/schedule/ScheduleOverviewTab.tsx)
- Messages: [`AdminMessagesPage.tsx`](src/components/school-admin/AdminMessagesPage.tsx), [`AdminMessagesInboxHeader.tsx`](src/components/school-admin/messages/AdminMessagesInboxHeader.tsx), `MessagesInboxLayout` `variant="admin-story"`
- Parent portal parallel: [`.agents/skills/parent-portal-story-design/SKILL.md`](../parent-portal-story-design/SKILL.md)
