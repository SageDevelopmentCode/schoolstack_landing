-- Organization progress log: August 30, 2026 — Parent portal, admin workspace, teacher dashboard, health (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_29.sql

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
  '2026-08-30'::date,
  '07',
  'v1 launch prep',
  'Refreshed parent portal, admin workspace, teacher dashboard, and student health',
  $summary$We gave the parent portal a full visual refresh — billing, home, My Children, messages, and the apply dashboard all feel clearer and easier to scan. School admins got a redesigned workspace with a new dashboard, smoother admissions tools, and improved student and staff rosters. Teachers now have a proper home screen with their assigned students and calendar, and families can add allergies, medications, and health updates for each child.$summary$,
  $highlights$[
    "Parent billing refresh — clearer due amounts, payment history, and autopay settings",
    "My Children overview — see each child's status at a glance and open their full record",
    "Redesigned parent messages — easier inbox, filters, and conversation threads",
    "Admin dashboard and rosters — focus queue, submissions next-step column, student and staff detail panels",
    "Teacher dashboard and student health — guides see their students; families manage health info per child"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
