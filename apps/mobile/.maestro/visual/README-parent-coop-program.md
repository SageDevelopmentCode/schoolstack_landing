# Parent program co-op visual capture

Maestro flows for **Kindergarten Co-op** program portal UI (Emily-style family preview).

## Flows

| Slug | File | What it captures |
|------|------|------------------|
| `parent-coop-teaching-schedule` | `parent-coop-teaching-schedule.yaml` | Schedule tab → teaching schedule screen |
| `parent-coop-more-menu` | `parent-coop-more-menu.yaml` | More sheet → Curriculum + Supply list |

Shared login: `parent-coop-program-preview.yaml` (platform admin → Rooted Meadows Waldorf School → Parent → Preview).

## Prerequisites

1. Standard mobile E2E stack ([mobile-e2e-local SKILL](../../../.agents/skills/mobile-e2e-local/SKILL.md)): local Supabase, `seed:e2e`, API `:3100`, `.env.e2e.local`, Metro on simulator.

2. **Co-op program data** for the previewed family. Vanilla `db reset` + `seed:e2e` includes **Rooted Meadows Waldorf School** (`rooted-meadows-school`) but not necessarily the **kindergarten-co-op** program portal. For full parity with Emily Bramwell preview, apply the rooted-meadows-demo manual SQL (Supabase SQL Editor), for example:

   - `supabase/migrations_manual/seed_rooted_meadows_demo_kindergarten_coop_parent_portal_2026_09_03.sql`
   - `supabase/migrations_manual/seed_rooted_meadows_demo_kindergarten_coop_teaching_schedule_2026_09_10.sql`

   Without coop data, preview may land on the main family portal and the **Schedule** tab / **Curriculum** More rows will not appear.

## Commands

```bash
# Both screenshots + artifact check
npm run mobile:visual:capture:coop-program

# Or one at a time
npm run mobile:visual:capture -- parent-coop-teaching-schedule
npm run mobile:visual:capture -- parent-coop-more-menu

# Checklist (after reading PNGs under apps/mobile/.artifacts/responsive/)
npm run verify:parent-coop-visual
```
