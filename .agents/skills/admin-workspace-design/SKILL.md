---
name: admin-workspace-design
description: >-
  School Day Story design system for school admin workspace pages. Use when
  redesigning admin pages to match the Rooted Meadows prototype, applying story
  tokens and Admin* UI primitives on enrollment flows and future admin modules.
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

### Page anatomy (builder pages)

```
EnrollmentFlowsStoryShell (paper bg, Fraunces + DM Sans)
  EnrollmentFlowsStoryHeader (kicker + h1 + subtitle + CTAs)
  Builder grid: AdminCard steps rail | AdminCard canvas
```

### Scope

- **In scope:** page content area inside `SchoolAdminBaseline`
- **Out of scope (until later):** sidebar, top bar, global admin nav

## Implementation checklist

1. Wrap page in `EnrollmentFlowsStoryShell` with `buildParentThemeTokens`
2. Use `theme` for new story surfaces; `parentThemeToAdminCompat(theme)` for legacy `C` props
3. Preserve `data-testid` hooks and all save/publish business logic
4. Match prototype builder: numbered steps, sage active state, field cards, save-state bar

## Reference

- Enrollment flows: [`ApplicationFormsPage.tsx`](src/components/school-admin/admissions/ApplicationFormsPage.tsx)
- Parent portal parallel: [`.agents/skills/parent-portal-story-design/SKILL.md`](../parent-portal-story-design/SKILL.md)
