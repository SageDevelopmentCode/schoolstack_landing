-- Organization progress log: September 20, 2026 — Attendance, push notifications, and activity inbox (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_19.sql

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
  '2026-09-20'::date,
  '07',
  'v1 launch prep',
  'Attendance, push notifications, and activity inbox',
  $summary$Teachers and admins can take attendance from the MudKitchen mobile app — mark present, absent, or late and record pickup details. Everyone gets push notifications when a new message arrives. A notification bell on the home screen shows recent school activity like enrollments and payments. Parents can also complete and sign forms from a dedicated Forms & Documents area.$summary$,
  $highlights$[
    "Mobile attendance — teachers and admins mark attendance by date with search and filters",
    "Push notifications — get alerted on your phone when a new message arrives; tap to open the thread",
    "Activity inbox — bell icon on home shows recent updates across the school",
    "Forms & Documents on mobile — complete and sign forms without leaving the app",
    "Unified home headers — consistent layout across parent, teacher, and admin apps"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
