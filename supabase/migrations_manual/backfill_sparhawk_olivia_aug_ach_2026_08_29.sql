-- Backfill: Rachael Sparhawk Olivia Aug 2026 tuition ACH payment recorded at checkout
-- Payment: 6694f4f0-fc6e-4708-b2b4-e26b1e324273
-- Charge:  0323b360-ba28-4f69-9784-f78e1d23e6df
-- Stripe PI: pi_3U9naRJPlPJpPJRq0BpOHQlr
-- Date: 2026-08-29 — pay-at-submission backfill after ACH checkout completed before code deploy

begin;

update application_payments
set
  status = 'succeeded',
  paid_at = coalesce(paid_at, '2026-08-29 14:47:45.161644+00'),
  amount_applied_cents = 42000,
  stripe_provider_status = 'processing'
where id = '6694f4f0-fc6e-4708-b2b4-e26b1e324273'
  and status = 'pending';

update tuition_charges
set
  status = 'paid',
  paid_cents = 42000,
  paid_at = coalesce(paid_at, '2026-08-29 14:47:45.161644+00')
where id = '0323b360-ba28-4f69-9784-f78e1d23e6df'
  and status <> 'paid';

commit;
