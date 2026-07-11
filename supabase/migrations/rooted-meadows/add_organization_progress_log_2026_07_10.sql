-- Organization progress log: July 10, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-10'::date,
  '01',
  'Admissions',
  'Families can finish enrollment — sign, upload, and pay online',
  'Building on yesterday''s enrollment kickoff, families can now work through their full checklist from their apply page. They can type their signature on agreements, upload required documents, and pay fees online with a card or bank account — with any processing fees shown clearly before they confirm. When everything is done, they see a celebration screen and their status updates to enrolled. For your team, the submissions table and detail view got a major upgrade: you can see each family''s admissions history, track enrollment step by step, review what they submitted, and view payment history alongside the application.',
  '[
    "Families sign enrollment forms with a typed signature",
    "Upload required documents directly during enrollment steps",
    "Pay application and enrollment fees online (card or bank)",
    "Processing fees shown clearly before checkout",
    "Families and staff can view payment history",
    "Upgraded submissions table and richer detail view in admin",
    "See a family''s full admissions history across applications",
    "Celebration screen and enrolled status when checklist is complete"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
