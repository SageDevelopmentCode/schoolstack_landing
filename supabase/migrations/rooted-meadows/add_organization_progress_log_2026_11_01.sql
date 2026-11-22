-- Organization progress log: November 1, 2026 — Families can read newsletters, plus committee projects (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_29.sql

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
  '2026-11-01'::date,
  '07',
  'v1 launch prep',
  'Families can read newsletters, plus committee projects',
  $summary$Families can now read school newsletters in the parent portal and the MudKitchen mobile app, including in the co-op portal, and get an email and push notification when a new edition is published. Committees can organise their work into projects with detailed supply lists. In enrollment, choosing Conditional Support now also requires the Standard Enrollment Agreement.$summary$,
  $highlights$[
    "Newsletters for families — read editions on the web and in the app",
    "Publish alerts — families get an email and push notification for each new edition",
    "Committee projects — supply lists with reusable or used-up items, months needed, owner, where to buy, and price",
    "Enrollment agreements — Conditional Support families also complete the Standard Enrollment Agreement",
    "Sturdier photo uploads — large uploads from the app are split up and recover from partial failures"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
