-- Organization progress log: September 18, 2026 — Roster emails and faster mobile messaging (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_17.sql

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
  '2026-09-18'::date,
  '07',
  'v1 launch prep',
  'Roster emails and faster mobile messaging',
  $summary$Admins can email a formatted Friday class roster to teachers or volunteers — with a preview before sending. Mobile messaging feels snappier with smoother send and clearer attachment display in conversation threads.$summary$,
  $highlights$[
    "Roster email with preview — review the layout before sending class lists",
    "Family contact info — student names, families, and enrollment status in one email",
    "Faster mobile messages — quicker send and clearer attachment bubbles in threads"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
