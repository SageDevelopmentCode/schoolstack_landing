-- Organization progress log: July 30, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
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
  '2026-07-30'::date,
  '03',
  'Tuition & billing',
  'Combined enrollment checkout, admin notifications, and a smoother committee setup',
  'We made enrollment payments simpler for families and gave your admin team better visibility into what''s happening on the platform. Families can now pay their deposit and enrollment fees together in one checkout — which can also save them on processing fees compared to paying each fee separately. Your team gets a new activity notification center for sign-ins and other important events. Committee creation is now a guided step-by-step wizard instead of a single form, and login routing is smarter so families and staff land in the right portal after they sign in.',
  '[
    "Combined enrollment checkout — families pay deposit and enrollment fees in one Stripe session",
    "Processing fee savings when families combine enrollment payments at checkout",
    "Admin activity notifications — unread badge and a panel for sign-ins and key events",
    "Committee create wizard — step-by-step setup from template through review",
    "Smarter login routing — families and staff land in the correct portal after sign-in",
    "Clearer enrollment checklist payment step with item details in a side panel"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
