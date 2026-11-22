-- Organization progress log: November 10, 2026 — Approval for hour changes (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_08.sql

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
  '2026-11-10'::date,
  '07',
  'v1 launch prep',
  'Approval for hour changes',
  $summary$Admins can choose to require approval when teachers adjust their hours, and review requests from a Requests panel on the web or in the MudKitchen mobile app. Teachers get an email and push notification when a change is approved or denied.$summary$,
  $highlights$[
    "Approval setting — turn on Require approval for hour adjustments in Staff Hours",
    "Requests panel — approve or deny teacher changes in one place",
    "Mobile support — teachers adjust hours and admins review requests from their phones",
    "Decision alerts — teachers get an email and push notification with the outcome"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
