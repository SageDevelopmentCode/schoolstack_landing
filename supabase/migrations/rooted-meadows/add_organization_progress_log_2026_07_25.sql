-- Organization progress log: July 25, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
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
  '2026-07-25'::date,
  '03',
  'Tuition & billing',
  'Parent billing portal, invoices, and the start of committees',
  'We made tuition and billing much more usable for families and your team. Parents now have a clearer Billing page with payment schedules, per-child charges, and a summary of what''s due. Your team can send invoices by email, fine-tune rates in the setup wizard, and preview how tuition rules calculate charges before they go out. We also started Phase 4 early — you can create committee workspaces from templates like Service & Sunshine. Families with two guardians can now invite a second parent to the portal, and your admin team has a new Documentation section with searchable how-to guides.',
  '[
    "Redesigned parent Billing page — schedules, per-child charges, and a clear summary of what''s due",
    "Send tuition invoices to families by email with one click",
    "Polished tuition setup wizard and a rules preview so you can check charges before they go out",
    "Committee workspaces — create groups from ready-made templates with tasks, calendar, and resources",
    "Second parent or guardian accounts — invite another adult to access the family portal",
    "New Documentation section in your admin with searchable guides for common tasks",
    "Clearer confirmation messages across admin when you save or complete an action"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
