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
- Parent portal parallel: [`.agents/skills/parent-portal-story-design/SKILL.md`](../parent-portal-story-design/SKILL.md)
