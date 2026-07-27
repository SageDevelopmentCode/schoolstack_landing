-- Organization progress log: July 4, 2026 — Phase 01 Admissions (Rooted Meadows)
-- Run after: add_product_organization_progress_log.sql (or add_product_timeline_bootstrap.sql)

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
  '2026-07-04'::date,
  '01',
  'Admissions',
  'Families can sign in before applying',
  'We added a secure sign-up and sign-in step at the start of your application form. When a family verifies their email, we automatically set up their family profile and application so they can start filling it out right away — and pick up where they left off if they come back later.',
  '[
    "Added sign-up and sign-in at the start of the application form",
    "Families verify their email with a one-time code for security",
    "Each family''s application is created automatically when they sign in",
    "Returning families can log back in and resume an in-progress application"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

## test