-- Organization progress log: September 16, 2026 — Admissions reminder emails and bulletin for families (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_15.sql

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
  '2026-09-16'::date,
  '07',
  'v1 launch prep',
  'Admissions reminder emails and bulletin for families',
  $summary$Families with unfinished applications or enrollment checklist steps now receive friendly reminder emails so nothing slips through the cracks. Parents and teachers can also read school bulletin posts from the MudKitchen mobile app, including PDF and image attachments.$summary$,
  $highlights$[
    "Incomplete admissions reminders — automatic emails when a draft or checklist step is still open",
    "Follow-up timing — a second reminder goes out if the family still has not finished",
    "Bulletin reading on mobile — parents and teachers view posts from home",
    "Attachment preview — open PDFs and images without leaving the app"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
