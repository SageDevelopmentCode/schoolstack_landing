-- Organization progress log: September 4, 2026 — Classrooms, bulletin, co-op portal (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_03.sql

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
  '2026-09-04'::date,
  '07',
  'v1 launch prep',
  'Classrooms, school bulletin, and co-op portal features',
  $summary$We added classrooms so you can group students and assign guides by room. A new school bulletin lets admins post updates to parents, teachers, or specific programs — with scheduling and attachments. Co-op families get a directory of other families in their program, can message each other, view a shared curriculum PDF, and discuss it in a thread alongside the document.$summary$,
  $highlights$[
    "Classroom management — create classrooms, assign students and staff, filter teacher rosters",
    "School bulletin — post updates with attachments, scheduling, and audience targeting",
    "Bulletin on home — families and teachers see recent school updates on their dashboard",
    "Co-op family directory — see other families in your program and send a message",
    "Co-op curriculum — upload a PDF for families and discuss it in a shared thread"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
