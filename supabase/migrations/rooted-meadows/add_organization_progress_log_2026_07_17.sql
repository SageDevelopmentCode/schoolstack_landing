-- Organization progress log: July 17, 2026 — Phase 02 Foundation (Rooted Meadows)
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
  '2026-07-17'::date,
  '02',
  'Foundation',
  'Your team can reach us directly — plus apply and enrollment portal polish',
  'We added a built-in way for your admin team to get help without leaving the dashboard. From any page in your school admin, you can open a support request, pick a topic like application forms or enrollment, describe what you need, and attach screenshots or files. We also polished the family-facing apply and enrollment experience — clearer loading states when saving or submitting, a cleaner branding bar at the top of the apply portal, and smoother enrollment checklist steps.',
  '[
    "Need help? modal in your school admin — submit support requests with topic, description, and attachments",
    "Support topics cover application forms, enrollment, billing, bugs, and feature requests",
    "Clearer loading states on Save, Submit, and Copy answers in the application form",
    "Refined apply portal branding bar with your school logo and navigation",
    "Smoother enrollment checklist item panels for families"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
