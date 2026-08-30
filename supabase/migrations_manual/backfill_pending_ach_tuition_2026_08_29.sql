-- Backfill: 3 pending ACH tuition payments (Rooted Meadows) — pay-at-submission
-- Date: 2026-08-29
-- Pattern matches backfill_sparhawk_olivia_aug_ach_2026_08_29.sql
--
-- Thompson (Maggie): payment 6260fb94…, charge 45caf91a…, PI pi_3U9sJ7…
-- Thompson (Nina):  payment 64689b86…, charge 65624a14…, PI pi_3U9sMc…
-- Caballero (Helene lump sum): payment 4efc9526…, charge 0cc30566…, PI pi_3U9vbJ…
--   $5,000 payment on $3,600 Aug installment → $1,400 surplus reduces Sep charge

begin;

-- Maggie Thompson — $720 Aug tuition
update application_payments
set
  status = 'succeeded',
  paid_at = coalesce(paid_at, '2026-08-29 19:52:26.42+00'),
  amount_applied_cents = 72000,
  stripe_provider_status = 'processing'
where id = '6260fb94-7f68-42cc-894a-747f315e4670'
  and status = 'pending';

update tuition_charges
set
  status = 'paid',
  paid_cents = 72000,
  paid_at = coalesce(paid_at, '2026-08-29 19:52:26.42+00')
where id = '45caf91a-dc10-4cc6-b6a3-be85a85912cf'
  and status <> 'paid';

-- Nina Thompson — $720 Aug tuition
update application_payments
set
  status = 'succeeded',
  paid_at = coalesce(paid_at, '2026-08-29 19:56:15.389565+00'),
  amount_applied_cents = 72000,
  stripe_provider_status = 'processing'
where id = '64689b86-194c-4ebf-a8a4-f18827cd6720'
  and status = 'pending';

update tuition_charges
set
  status = 'paid',
  paid_cents = 72000,
  paid_at = coalesce(paid_at, '2026-08-29 19:56:15.389565+00')
where id = '65624a14-a865-48eb-b974-f2a69961d0d3'
  and status <> 'paid';

-- Helene Caballero — $5,000 lump sum ($3,600 Aug + $1,400 pay-ahead)
update application_payments
set
  status = 'succeeded',
  paid_at = coalesce(paid_at, '2026-08-29 23:21:55.245171+00'),
  amount_applied_cents = 360000,
  stripe_provider_status = 'processing'
where id = '4efc9526-8b2a-47ad-b1f7-0de90945d892'
  and status = 'pending';

update tuition_charges
set
  status = 'paid',
  paid_cents = 360000,
  paid_at = coalesce(paid_at, '2026-08-29 23:21:55.245171+00')
where id = '0cc30566-d6ab-479b-abe0-1f547bd41a5c'
  and status <> 'paid';

-- Surplus $1,400 applied to Sep installment (360000 → 220000)
update tuition_charges
set amount_cents = 220000
where id = '73ef7a78-269e-48c5-9332-20f607a84744'
  and assignment_id = 'ea61b5e9-1c6f-40dd-a1f2-827fac654761'
  and status = 'scheduled'
  and amount_cents = 360000;

commit;
