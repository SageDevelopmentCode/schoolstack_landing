-- rooted-meadows-demo autopay retry helper (2026-08-01)
--
-- Root cause: Julius saved a card via localhost using Stripe TEST mode, but
-- production cron on trymudkitchen.com uses a different STRIPE_SECRET_KEY.
-- The saved PM id only exists in test Stripe, so production autopay failed.
--
-- STEP 1 (Julius): Re-save card on production, not localhost:
--   https://trymudkitchen.com/school/rooted-meadows-demo/parent/billing
--
-- STEP 2 (admin): After deploy, click "Process due charges" in Tuition settings
--   OR trigger cron:
--   curl -H "Authorization: Bearer $CRON_SECRET" \
--     https://trymudkitchen.com/api/cron/tuition-billing
--
-- STEP 3 (optional cleanup): Remove stale test-mode PM after a new card is saved.
--   Only run after confirming a new family_payment_methods row exists.

-- Verify current state
select
  tc.id,
  tc.label,
  tc.status,
  tc.due_date,
  tc.amount_cents,
  fpm.stripe_payment_method_id,
  fpm.last4,
  fpm.created_at
from tuition_charges tc
join families f on f.id = tc.family_id
join organizations o on o.id = f.organization_id
left join tuition_billing_accounts tba on tba.family_id = f.id
left join family_payment_methods fpm on fpm.billing_account_id = tba.id
where o.slug = 'rooted-meadows-demo'
  and f.name = 'Cecilia Family'
  and tc.id = '0dd19841-b295-48c5-91fc-8fa28260d0b5';

-- Optional: delete stale test-mode payment method after re-save
-- delete from family_payment_methods
-- where stripe_payment_method_id = 'pm_1Tz9jzJLV7MBUTD3rakJJg84';
