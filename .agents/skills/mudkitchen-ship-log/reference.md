# MudKitchen ship log — reference

Templates, allowlists, and consolidation examples. Main workflow: [SKILL.md](SKILL.md).

## Build log SQL template

```sql
-- Organization progress log: <Month Day, Year> — <Short title> (Rooted Meadows)
-- Run after: add_organization_progress_log_<previous>.sql

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights
)
select
  o.id,
  'YYYY-MM-DD'::date,
  '07',
  'v1 launch prep',
  '<Short user-facing title>',
  $summary$<1–3 sentences. Say MudKitchen / MudKitchen mobile app where relevant.>$summary$,
  $highlights$[
    "<Feature — plain-language benefit>",
    "<Feature — plain-language benefit>"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
```

Batch paste header:

```sql
-- Rooted Meadows build logs: <start>–<end> (<N> entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_<prior>.sql
-- Idempotent — safe to re-run.
```

## Admin dashboard card template

```sql
insert into public.admin_feature_announcements (
  organization_id,
  announcement_id,
  title,
  description,
  cta_label,
  feature_key,
  href_path,
  published_at,
  sort_order
)
select
  null,
  seed.*
from (values
  ('my-slug', 'Title', 'One-sentence description.', 'Try it now', 'committees', 'committees', '2026-09-21', 0)
) as seed(
  announcement_id, title, description, cta_label,
  feature_key, href_path, published_at, sort_order
)
where not exists (
  select 1 from public.admin_feature_announcements existing
  where existing.organization_id is null
    and existing.announcement_id = seed.announcement_id
);
```

`cta_label`: `'Try it now' | 'View' | 'Open'`

## Parent dashboard card template

Same as admin, plus `portal_scope`:

```sql
-- columns: ..., portal_scope, published_at, sort_order
-- values: (..., 'coop', '2026-09-21', 0)
```

`portal_scope`: `'any'` (all parent portals), `'coop'` (program/co-op portal only), `'main'` (main school portal only).

## Admin feature_key and href_path map

Allowed keys: `src/lib/admin/admin-feature-announcements-storage.ts` → `ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS`

| feature_key | Common href_path | Typical feature |
|-------------|------------------|-----------------|
| `admissions` | `admissions/programs` | Co-op programs, supply list, teaching schedule |
| `admissions` | `admissions/submissions` | Admissions queue, reminder emails |
| `my_school` | `my_school/tuition` | Tuition workspace, waive charges |
| `my_school` | `my_school/classrooms` | Classroom management |
| `my_school` | `my_school/forms_documents` | Forms and documents hub |
| `my_school` | `my_school/friday_branch` | Friday Branch (schedule, rosters, pricing) |
| `my_school` | `my_school/attendance` | Attendance |
| `committees` | `committees` | Committee workspaces |
| `messages` | `messages` | Broadcasts, messaging |
| `bulletin` | `bulletin` | School bulletin |

Resolved href: `/school/{slug}/admin/{feature_key}/{subtab}` via `resolveAdminFeatureAnnouncementHref`.

## Parent feature_key and href_path map

Allowed keys: `src/lib/admin/parent-feature-announcements-storage.ts` → `PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS`

Also used in cards (must match enabled parent features): `forms_documents`, `friday_branch`

| feature_key | href_path | portal_scope | Typical feature |
|-------------|-----------|--------------|-----------------|
| `portal` | `documentation` | `any` | Activity notifications, how-to guides |
| `portal` | `portal` | `any` / `coop` | Home, portal switcher |
| `committees` | `committees` | `coop` | Join committees, attachments |
| `classroom_signups` | `classroom_signups` | `any` | Volunteer sign-ups |
| `forms_documents` | `forms_documents` | `any` | Forms and documents |
| `friday_branch` | `friday_branch` | `coop` | Friday class enrollment |
| `messages` | `messages` | `any` / `coop` | Messaging, push alerts |
| `attendance` | `attendance` | `any` | Attendance history |
| `supply_list` | `supply_list` | `coop` | Co-op supply list |
| `teaching_schedule` | `teaching_schedule` | `coop` | Co-op teaching schedule |
| `curriculum` | `curriculum` | `coop` | Curriculum guides |
| `bulletin` | `portal` | `any` | Bulletin on home |

## Consolidation examples

Canonical range: **Sep 14–22, 2026** (see `20261022_*`, `20261023_*`, `20261024_consolidate_*` migrations).

### Admin — merge before shipping

| Instead of (redundant) | One card | announcement_id to keep |
|------------------------|----------|---------------------------|
| Friday Branch scheduling + roster emails + price/flyer | **Friday Branch** — schedules, roster emails, price, flyer, parent enrollment | `friday-branch-scheduling` |
| Committee workspace + message attachments | **Committee workspaces** — workspace + file attachments in chat | `committee-workspace` |

Keep separate (different destinations): message broadcasts (`messages`), forms hub (`my_school/forms_documents`), admissions reminders (`admissions/submissions`), mobile attendance (`my_school/attendance`).

### Parent — merge before shipping

| Instead of (redundant) | One card | announcement_id to keep |
|------------------------|----------|---------------------------|
| Friday enrollment + pricing/flyer | **Friday Branch classes** — enroll, waitlist, price, flyer | `friday-branch-enrollment` |
| Join committee + share files in chat | **Join a parent committee** — browse, join, attachments | `parent-committees` |

### Production consolidate SQL (cards already live)

When separate cards were already inserted, run UPDATE + DELETE — see `supabase/migrations_manual/consolidate_dashboard_cards_sep_14_22_2026_09_22.sql`:

```sql
update public.admin_feature_announcements
set title = '...', description = '...', published_at = 'YYYY-MM-DD'::date
where organization_id is null and announcement_id = '<survivor-id>';

delete from public.admin_feature_announcements
where organization_id is null
  and announcement_id in ('<redundant-id-1>', '<redundant-id-2>');
```

Repeat for `parent_feature_announcements`.

## Static fallback and tests

After SQL seeds, mirror every new/updated card in:

- `src/lib/school-admin/admin-feature-announcements.ts` → `STATIC_ADMIN_FEATURE_ANNOUNCEMENTS`
- `src/lib/parent-portal/parent-feature-announcements.ts` → `STATIC_PARENT_FEATURE_ANNOUNCEMENTS`

Update test assertions for total in-window counts and top-card `announcement_id` after changes. Tests use a fixed `now` (e.g. Sep 10, 2026) and `sinceDays: 14` — recalculate counts when adding or removing static entries.

## File locations summary

| Deliverable | Location |
|-------------|----------|
| Daily build log | `supabase/migrations/rooted-meadows/add_organization_progress_log_YYYY_MM_DD.sql` |
| Build log batch | `supabase/migrations_manual/rooted_meadows_progress_log_*_to_*.sql` |
| Admin cards migration | `supabase/migrations/<timestamp>_add_admin_feature_announcements_*.sql` |
| Parent cards migration | `supabase/migrations/<timestamp>_add_parent_feature_announcements_*.sql` |
| Cards batch | `supabase/migrations_manual/dashboard_cards_*.sql` |
| Consolidate cleanup | `supabase/migrations/<timestamp>_consolidate_feature_announcements_*.sql` |
| Sync to production org | `supabase/migrations_manual/sync_rooted_meadows_progress_log_to_production.sql` |

SQL folder rules: [`.agents/skills/supabase-migrations/SKILL.md`](../supabase-migrations/SKILL.md)
