-- Organization progress log: July 11, 2026 — Phase 01 Admissions (Rooted Meadows)
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
values (
  'c14e04d2-d39a-4704-af0a-847edae8220a'::uuid,
  '2026-07-11'::date,
  '01',
  'Admissions',
  'Guides for sharing your apply link and walking families through enrollment',
  'We added built-in walkthroughs so your team always knows how to onboard families — from publishing and sharing your apply link to starting enrollment after acceptance. The family apply dashboard also now uses your school''s branding on buttons and actions, with a clearer layout when enrolled families still have applications in progress.',
  '[
    "\"How to share\" guide on the application form page — publish, copy link, and walk through what families see",
    "\"How parents access\" guide on the enrollment checklist page — from Start enrollment to completion",
    "Step-by-step modals with your school''s colors and the exact paths families use",
    "Family apply dashboard buttons match your school branding",
    "Clearer apply dashboard layout when families have both enrolled access and active applications"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
