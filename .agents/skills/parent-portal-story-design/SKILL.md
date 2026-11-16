---
name: parent-portal-story-design
description: >-
  RETIRED. The parent portal now uses the "Garden dashboard" system. Use
  parent-portal-garden-design for any parent portal page instead.
---

# Parent Portal — School Day Story Design (retired)

**Superseded by [`parent-portal-garden-design`](../parent-portal-garden-design/SKILL.md).**

The parent Home was rebuilt as a Garden dashboard: Garden type and materials at portal density, in the school's own accent colour. Every parent tab is migrating to it. Use the new skill for anything under `src/app/school/[slug]/parent/` or `src/components/school-parent/`.

Some points from this skill still apply, and the new skill carries them forward:
- **Preview parity:** the live route and `/admin/preview/{slug}/family/{familyId}/parent/{feature}` share one client component. `previewMode`/`readOnly` disables actions; it never hides UI.
- **Shared layouts** (for example `MessagesInboxLayout`) get a parent `variant`. Don't fork business logic.
- **Tests:** keep every `data-testid`.
- **Data:** fetch logic stays in `src/lib/`.

**Tabs not migrated yet** still render the School Day Story primitives in `src/components/school-parent/ui/` (`ParentCard`, `ParentButton`, `ParentChip`, `ParentStoryPillNav`, …) with `useParentTheme()` tokens. Leave them as they are until a tab is migrated per the new skill's checklist. Don't add new School Day Story surfaces to the parent portal.
