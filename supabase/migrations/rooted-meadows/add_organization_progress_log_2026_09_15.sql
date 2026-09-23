-- Organization progress log: September 15, 2026 — Parent broadcasts, forms hub, and teacher mobile portal (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_14.sql

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
  '2026-09-15'::date,
  '07',
  'v1 launch prep',
  'Parent broadcasts, forms hub, and teacher mobile portal',
  $summary$Admins can send targeted messages to groups of parents — by program, classroom, grade, or hand-picked families — and each family receives it as their own private thread. A new forms workspace tracks every parent form across the school. Teachers get a full MudKitchen mobile portal with classroom rosters, calendar, messages, and a home screen that highlights tasks needing attention.$summary$,
  $highlights$[
    "Targeted broadcasts — send a message to filtered groups; each family gets their own thread",
    "Admin forms hub — see all forms, signature progress, and downloads in one place",
    "Teacher mobile portal — home, calendar, messages, and my students on phone",
    "Parent forms snapshot — home card shows forms that still need a signature"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
