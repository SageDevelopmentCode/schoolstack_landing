-- Organization progress log: August 22, 2026 — School admin mobile expansion (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_21.sql

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
  '2026-08-22'::date,
  '06',
  'Mobile app',
  'School admin mobile — messages, staff, schedule, and payments',
  $summary$The school admin mobile app gained the tools you reach for most during the day. Admins can read and send portal messages, review tuition transactions, browse and edit staff records, and manage the admissions schedule — tours, shadow days, and school events — all from the phone app.$summary$,
  $highlights$[
    "Messages inbox — read and reply to family and staff conversations on mobile",
    "Start new conversations — reach a family or colleague without opening a laptop",
    "Tuition transactions — see recent payments and charges with filters",
    "Staff directory — view team members, roles, and assigned students",
    "Admissions schedule — manage tours, shadow days, and calendar events on the go"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
