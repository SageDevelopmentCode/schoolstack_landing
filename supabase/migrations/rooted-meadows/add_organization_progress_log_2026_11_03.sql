-- Organization progress log: November 3, 2026 — Staff time clock (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_01.sql

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
  '2026-11-03'::date,
  '07',
  'v1 launch prep',
  'Staff time clock',
  $summary$Teachers can now clock in and out from the web or the MudKitchen mobile app and see their hours by day, week, and month. Admins get a Staff Hours tab under My School showing who is on the clock and each person's totals, plus a Staff hours today card on the Dashboard. Admins can also send one message to many families from the mobile app.$summary$,
  $highlights$[
    "My Hours for teachers — clock in and out with a running timer and day, week, and month totals",
    "Staff Hours for admins — who is on the clock now, with hours and sessions per staff member",
    "Dashboard card — Staff hours today at a glance",
    "Broadcast from mobile — message families by program, classroom, grade, or parent",
    "Reliable clock-out — double taps or two devices no longer cause trouble"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
