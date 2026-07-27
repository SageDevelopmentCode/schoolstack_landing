-- Organization progress log: July 15, 2026 — Phase 02 Foundation (Rooted Meadows)
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
  '2026-07-15'::date,
  '02',
  'Foundation',
  'Families can book shadow days; your team gets alerts on new applications',
  'Building on yesterday''s import of your real applications, we finished the observation visit flow your process needs. After a family applies, they can book two or three full school days in a row so their child can shadow class while your teachers observe — you choose which dates are open each month, and families pick from a simple calendar. Your team also gets an email the moment someone submits an application, with the student''s name and a direct link to review it. You can choose which staff addresses receive those alerts on each form.',
  '[
    "Families book consecutive shadow/observation days — not just a single appointment slot",
    "You set which school days are open for observations each month",
    "Booked observation days show up in your admin schedule alongside tours and interviews",
    "Email alerts when a new application is submitted",
    "Choose who gets notified per application form",
    "Cleaner application form editor for your team"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
