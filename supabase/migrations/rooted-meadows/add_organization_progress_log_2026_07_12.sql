-- Organization progress log: July 12, 2026 — Phase 01 Admissions complete (Rooted Meadows)
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
  '2026-07-12'::date,
  '01',
  'Admissions',
  'Phase 1 complete — your admissions system is ready',
  'Today we finished polishing the admissions experience and closed out Phase 1. Families now have smoother form fields for addresses, dates, and file uploads; clearer fee breakdowns before they pay; and a more reliable parent sign-in. Your team gets a cleaner form builder, richer submission detail views with step-by-step progress and payment history, and guided walkthroughs for sharing your apply link and starting enrollment. We also tightened parent data access so families only see their own information, and your standard and conditional enrollment agreements are configured and ready.',
  '[
    "Phase 1 (Admissions) is complete — apply, accept, enroll, and pay are all wired up",
    "Smoother application forms: address, date, file upload, and sign-in polish",
    "Fee breakdowns shown clearly on application and enrollment payments",
    "Admin submission detail: step timeline, payment history, and enrollment status at a glance",
    "Improved guides for sharing your apply link and walking families through enrollment",
    "Standard and Conditional Support enrollment agreements configured for your programs",
    "Parent portal security tightened so families only access their own records"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
