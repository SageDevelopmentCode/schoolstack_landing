-- Organization progress log: November 15, 2026 — My School redesign and a new parent app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_14.sql

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
  '2026-11-15'::date,
  '07',
  'v1 launch prep',
  'My School redesign and a new parent app',
  $summary$Every My School tab in the admin portal was redesigned, from School Profile and Staff to Attendance, Friday Branch, and Tuition, with clearer save bars, undo, and visible retry when something fails. Admissions got the same treatment. In the MudKitchen mobile app, the parent experience was rebuilt with a new tab bar and refreshed Home, Billing, Messages, Calendar, Children, Committees, and Attendance.$summary$,
  $highlights$[
    "My School redesign — every tab refreshed, with save bars, undo, and retry instead of silent failures",
    "Safer edits — Friday Branch and Tuition never save over real data after a failed load",
    "Handy shortcuts — move students between classrooms and see who still needs attendance",
    "Admissions redesign — a cleaner admissions workspace",
    "New parent app — new tab bar plus redesigned Home, Billing, Messages, Calendar, Children, and more"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
