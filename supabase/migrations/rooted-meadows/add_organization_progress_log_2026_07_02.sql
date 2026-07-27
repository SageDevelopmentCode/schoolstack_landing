-- Organization progress log: July 2, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-02'::date,
  '01',
  'Admissions',
  'Starting your admissions system',
  'We kicked off Phase 1: Admissions for Rooted Meadows. Today we built the secure database structure behind your application form, observation visits, enrollment contracts, and parent checklists — the same pieces you see in the timeline prototype, now backed by real storage on the platform. We also added a "Build progress" section to your timeline page so you can follow along as we ship each piece over the next two weeks.',
  '[
    "Added a build progress log to your timeline page so you can see what we ship each day",
    "Started building your MudKitchen-hosted application form and fee collection",
    "Prepared secure storage for family applications and observation scheduling",
    "Prepared enrollment checklists for agreements, health forms, and supply fees",
    "Set up per-school customization so your form and checklist match Rooted Meadows"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
