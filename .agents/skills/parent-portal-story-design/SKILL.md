---
name: parent-portal-story-design
description: >-
  School Day Story design system for the parent portal. Use when redesigning or
  adding parent portal pages, matching the Rooted Meadows prototype, or applying
  ParentThemeTokens and story UI primitives (ParentCard, ParentButton, etc.).
---

# Parent Portal — School Day Story Design

## When to use

- Redesigning or building a **parent portal** page under `src/app/school/[slug]/parent/`
- Matching the Rooted Meadows interactive prototype (`rooted-meadows-portal-prototype.html`)
- Applying consistent typography, colors, cards, and motion with Home / Billing / Messages

## Design system

### Tokens

- Build tokens: `buildParentThemeTokens(branding)` in [`src/lib/organization-settings/parent-theme.ts`](src/lib/organization-settings/parent-theme.ts)
- Runtime hook: `useParentTheme()` from [`ParentThemeContext.tsx`](src/components/school-parent/ParentThemeContext.tsx) — returns `{ theme, adminCompat }`
- Use **`theme`** for all new story surfaces
- Use **`adminCompat`** (`parentThemeToAdminCompat`) only for legacy widgets that still expect `AdminThemeTokens` (student badge colors, some shared message rows)

### UI primitives (`src/components/school-parent/ui/`)

| Component | Use for |
|-----------|---------|
| `ParentSectionKicker` | Eyebrow / section label above headings |
| `ParentDisplayHeading` | Fraunces page and section titles (`size="display"` or `"section"`) |
| `ParentCard` | White or tinted surfaces (`default`, `today`, `primary`) |
| `ParentButton` | Primary, soft, outline CTAs |
| `ParentChip` | Status / category pills (`success`, `warning`, `alert`, `info`) |
| `ParentStoryPillNav` | Sage pill segmented nav (billing child tabs, school record sections) |
| `ParentDatePill` | Date badges in headers |
| `ParentAttentionItem` | “Start here” action rows on home |
| `ParentTextLink` / `ParentButtonLink` | Inline and navigational links |

### Page anatomy

```
max-w-[1250px] mx-auto px-4 py-6 sm:py-8 md:px-9
  Parent{Feature}StoryHeader   ← kicker + Fraunces h1 + muted subtitle + optional CTA
  main content (cards, grids, embedded tools)
```

- Paper canvas comes from parent baseline CSS vars (`parentThemeCssVars`)
- Cards: `theme.white` background, `theme.line` border, `theme.radiusCard`, `theme.shadowCard`
- Muted copy: `theme.muted`; body text: `theme.ink`; accents: `theme.primary`

### Motion

- Easing: `[0.16, 1, 0.3, 1]`
- Duration: ~220–350ms fade/slide
- Reuse shared constants when switching views (e.g. [`parent-billing-view-transition.ts`](src/components/school-parent/billing/parent-billing-view-transition.ts))
- Prefer `framer-motion` `AnimatePresence mode="wait"` for tab/panel swaps

### Shared features with admin/teacher

When a feature already has a shared layout (e.g. `MessagesInboxLayout`):

1. Add a **`parent-story`** (or similar) variant — do not fork business logic
2. Pass `theme` + `adminCompat` from the parent page shell
3. Gate story-only styling with `isStoryMessagesVariant(variant)` helpers in [`messages-layout-variant.ts`](src/lib/messages/messages-layout-variant.ts)

## Implementation checklist

1. Page component uses `useParentTheme()` — avoid `buildAdminThemeTokens` for new UI
2. Extract `Parent{Feature}StoryHeader.tsx` when the page has hero copy
3. Keep data/fetch logic in `src/lib/`; presentation in `src/components/school-parent/`
4. **Preview parity**: live route + `/admin/preview/{slug}/family/{familyId}/parent/{feature}` must share the same client component; use `previewMode` / `readOnly` to disable actions, not hide UI ([`family-preview-parity.mdc`](.cursor/rules/family-preview-parity.mdc))
5. Preserve existing `data-testid` hooks
6. Mobile: stack header CTAs full-width; use `sm:` breakpoints for grids

## Reference pages

| Page | Key files |
|------|-----------|
| Home | [`ParentHomePage.tsx`](src/components/school-parent/ParentHomePage.tsx) |
| Billing | [`ParentBillingPage.tsx`](src/components/school-parent/billing/ParentBillingPage.tsx), [`ParentBillingStoryHeader.tsx`](src/components/school-parent/billing/ParentBillingStoryHeader.tsx) |
| Messages | [`ParentMessagesPage.tsx`](src/components/school-parent/ParentMessagesPage.tsx), [`ParentMessagesInboxHeader.tsx`](src/components/school-parent/messages/ParentMessagesInboxHeader.tsx), `MessagesInboxLayout` `variant="parent-story"` |
| My Children | [`ParentChildrenPage.tsx`](src/components/school-parent/ParentChildrenPage.tsx), [`ParentChildrenStoryHeader.tsx`](src/components/school-parent/children/ParentChildrenStoryHeader.tsx), [`ParentChildRecordWorkspace.tsx`](src/components/school-parent/children/ParentChildRecordWorkspace.tsx) |

## Anti-patterns

- Do not use admin flat gray cards (`C.surface` / `C.elevated`) for new parent surfaces
- Do not duplicate entire admin/teacher components when a `variant` prop suffices
- Do not remove or rename E2E `data-testid` selectors without updating `e2e/parent/`
- Do not hide preview UI that exists on live routes — disable interactions instead

## Prototype mapping (Messages example)

| Prototype | Story implementation |
|-----------|------------------------|
| Eyebrow “Family communication” | Omitted — sidebar header is title + `+ New` only |
| “+ New message” | `ParentMessagesInboxHeader` compact `+ New` button |
| Inbox header | `ParentMessagesInboxHeader`: title + `+ New` + search (no filter tabs) |
| Chat pane background | `theme.paper` / `#EFF5F0` — contrasts with white inbox column |
| Thread bubbles | Avatars beside bubbles; sender name in `theme.primary` (incoming) or soft white (own); body text separate color |
| Full-height split pane | `MessagesInboxLayout` `parent-story`: `flex-1 min-h-0`, `340px` inbox column |
