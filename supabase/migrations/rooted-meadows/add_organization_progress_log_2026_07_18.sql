-- Organization progress log: July 18, 2026 — Phase 02 Foundation (Rooted Meadows)
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
  '2026-07-18'::date,
  '02',
  'Foundation',
  'Parent portal takes shape — children hub, sign-in, and form builder polish',
  'We expanded what families see in the parent portal and made your admissions tools easier to manage. Parents can now open a Children page to see each student''s application status and enrollment progress in one place, with a profile panel for the details that matter. Sign-in is unified — families pick Rooted Meadows, verify their email, and land in the right portal. We also rebuilt dropdown fields on application forms so they work reliably on phones, and gave your team a cleaner workspace for managing application forms and enrollment checklists side by side. Families can also share feedback on upcoming portal features and send support requests without leaving the portal.',
  '[
    "New parent portal Children page — each student''s status, progress, and profile in one place",
    "Unified login with a school picker and smart redirect to the parent or admin portal",
    "Dropdown and select fields on application forms work reliably on mobile",
    "Redesigned forms workspace — application forms and enrollment checklists in one sidebar",
    "Edit dropdown answer options directly in the form builder",
    "Families can send feedback on upcoming parent portal features",
    "Parents can submit support requests from the portal"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
