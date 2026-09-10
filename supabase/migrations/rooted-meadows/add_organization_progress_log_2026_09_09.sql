-- Organization progress log: September 9, 2026 — Co-op supply list and teaching schedule (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_08.sql

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
  '2026-09-09'::date,
  '07',
  'v1 launch prep',
  'Co-op supply list and parent teaching schedule',
  $summary$Co-op programs can publish a supply list where parents sign up to bring specific items — no more duplicate purchases or confusion about who is bringing what. Families can also view the teaching schedule and volunteer to lead a co-op day, with admins managing slots from the programs page.$summary$,
  $highlights$[
    "Supply list — parents claim items they will bring; see what's still needed",
    "Teaching schedule — view co-op days and sign up to teach or help",
    "Admin schedule tools — set up weeks, slots, and volunteer roles per program",
    "Bulletin on co-op home — recent school updates visible in the program portal"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
