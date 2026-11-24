-- Organization progress log: November 7, 2026 — Family privacy, a faster parent portal, and safer sign-ups (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_03.sql

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
  '2026-11-07'::date,
  '07',
  'v1 launch prep',
  'Family privacy, a faster parent portal, and safer sign-ups',
  $summary$Family data is locked down further: a parent can only ever read their own family's billing, payment methods, and signatures. The parent sign-in page was redesigned and parent pages load faster. Classroom sign-ups now check capacity and eligibility so a slot can never be overfilled.$summary$,
  $highlights$[
    "Stronger family privacy — billing, payment, and signature data stay with each family",
    "New parent sign-in — a redesigned sign-in page",
    "Faster parent pages — quicker access checks on every page",
    "Safer classroom sign-ups — capacity and eligibility enforced, and withdrawals apply to the right child",
    "Lighter PDFs on mobile — large curriculum PDFs load only the pages being read"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
