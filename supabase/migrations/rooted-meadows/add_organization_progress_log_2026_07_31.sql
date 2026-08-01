-- Organization progress log: July 31, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
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
