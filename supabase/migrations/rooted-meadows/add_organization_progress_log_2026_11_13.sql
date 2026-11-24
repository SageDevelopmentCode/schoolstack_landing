-- Organization progress log: November 13, 2026 — Parent portal redesign begins (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_12.sql

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
  '2026-11-13'::date,
  '07',
  'v1 launch prep',
  'Parent portal redesign begins',
  $summary$The parent portal is getting a fresh, friendlier look. The new Home starts with a Start here to-do list and a card for each child with their enrollment progress, alongside upcoming events and the bulletin. Messages, Billing, Calendar, and Committees were redesigned too, and admins got a refreshed committee workspace.$summary$,
  $highlights$[
    "New parent Home — Start here, child cards with checklist progress, events, bulletin, and forms",
    "Tuition setup tracker — plan, agreements, payment method, and pay, step by step",
    "Calendar views — new month and week views with an event drawer",
    "Redesigned Messages and Committees — for parents, with a refreshed admin committee workspace"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
