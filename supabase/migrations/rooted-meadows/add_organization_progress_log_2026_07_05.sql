-- Organization progress log: July 5, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-05'::date,
  '01',
  'Admissions',
  'Staff login, family dashboard, and submission review',
  'We secured your admin dashboard so only invited staff can sign in. Families now land on a personal apply page where they can see their applications, continue a draft, or review something they already submitted — and they get a confirmation email when they finish. On your side, there is a new submissions area to review incoming applications, plus logo upload in settings and a clearer payment setup checklist.',
  '[
    "Added secure staff login for your school admin dashboard",
    "Families get a personal apply page to track, continue, or view submitted applications",
    "Built a submissions inbox in admin to review incoming applications",
    "Every application form includes required student questions (name, birthday, grade)",
    "Families receive a confirmation email when they submit an application"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
