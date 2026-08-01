-- Rooted Meadows build log: July 30–31, 2026
-- Covers PR #13 (combined checkout, notifications, committee wizard)
-- and PR #14 (billing splits, autopay, late fees)
-- Run in Supabase SQL Editor on remote. Safe to re-run (idempotent).

-- ── July 30 ──────────────────────────────────────────────────────────────────

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

-- ── July 31 ──────────────────────────────────────────────────────────────────

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
  '2026-07-31'::date,
  '03',
  'Tuition & billing',
  'Billing splits, autopay, late fees, and a stronger parent billing experience',
  'This was a big billing day. Families can now split tuition between guardians, enroll in autopay, and manage a saved payment method from the parent billing page. Your team can configure late fees in the tuition setup wizard — including grace periods and per-month overrides — and the system applies them automatically when charges go overdue. Parents can pay multiple charges at once, and your activity log now shows staff names on events. Behind the scenes, daily billing and autopay runs now report status to Discord so we can catch issues early.',
  '[
    "Split billing between guardians — assign each parent a share of tuition charges",
    "Parent autopay — families save a card and turn on automatic payments",
    "Payment method card on parent billing — add or update saved cards anytime",
    "Late fee settings in tuition setup — grace period, amount, and monthly day overrides",
    "Automated late fee charges when payments are overdue",
    "Pay multiple charges at once from the parent billing page",
    "Activity log improvements — staff names on events and a clearer MudKitchen feed",
    "Daily billing and autopay cron with Discord status reports"
  ]'::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
