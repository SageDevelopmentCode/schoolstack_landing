-- Organization progress log: October 29, 2026 — Newsletters saved with version history (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_28.sql

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
  '2026-10-29'::date,
  '07',
  'v1 launch prep',
  'Newsletters saved with version history',
  $summary$Newsletters are now saved in MudKitchen, with drafts and published editions, a school-wide template, and version history so admins can restore an earlier version. On mobile, the keyboard no longer covers what you are typing in messages and forms.$summary$,
  $highlights$[
    "Saved newsletters — drafts and published editions kept safely",
    "School template — start each edition from the school's own template",
    "Version history — restore an earlier version of any edition",
    "Keyboard fix — typing in messages, sheets, and forms stays visible on mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
