-- Organization progress log: July 6, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-06'::date,
  '01',
  'Admissions',
  'Families can book tours and interviews after applying',
  'After a family submits an application, they can now complete next steps right from their apply page — like scheduling a campus tour, a parent interview, or a student shadow day. You choose which steps to require for each form and set the times you are available. Families pick a slot that works for them, and the scheduled visit shows up on their dashboard.',
  '[
    "Added next steps families complete after submitting an application",
    "You can require campus tours, parent interviews, or shadow days per form",
    "Set your available appointment times in the form builder",
    "Families book visits from their personal apply page",
    "Scheduled appointments are visible once a family picks a time"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
