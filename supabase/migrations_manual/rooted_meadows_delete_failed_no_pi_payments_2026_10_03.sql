-- 2026-10-03: Rooted Meadows — remove failed application_payments that never
-- created a Stripe PaymentIntent (autopay ghosts). Each affected tuition_charge
-- still has exactly one succeeded payment. Safe to re-run (DELETE is idempotent).

-- Pre-check: should return 0 rows (no charge with 2+ succeeded payments)
select tuition_charge_id, count(*) filter (where status = 'succeeded') as succeeded_cnt
from application_payments
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and payment_type = 'tuition'
  and tuition_charge_id in (
    select tuition_charge_id
    from application_payments
    where id in (
      'f438353d-2e10-40ef-b941-3ee1877ab6f6',
      '60f2297d-0f84-4ab6-a678-2781881a73b6',
      'dd0a5887-2bb8-4b84-ac96-8060eab5eaa8',
      'a59332ed-64e4-4700-b4f0-0d0ed32de715',
      '16a7db5d-7e5a-4243-b0ac-595a0f09b2b7',
      '87c279e6-b9fe-433a-a66d-13d2085d8e96',
      '8f6fdda1-0510-4285-8af2-5e3c961b9db4'
    )
  )
group by tuition_charge_id
having count(*) filter (where status = 'succeeded') > 1;

delete from application_payments
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and status = 'failed'
  and stripe_payment_intent_id is null
  and id in (
    'f438353d-2e10-40ef-b941-3ee1877ab6f6',
    '60f2297d-0f84-4ab6-a678-2781881a73b6',
    'dd0a5887-2bb8-4b84-ac96-8060eab5eaa8',
    'a59332ed-64e4-4700-b4f0-0d0ed32de715',
    '16a7db5d-7e5a-4243-b0ac-595a0f09b2b7',
    '87c279e6-b9fe-433a-a66d-13d2085d8e96',
    '8f6fdda1-0510-4285-8af2-5e3c961b9db4'
  );

-- Post-check: should return 0
select count(*) as failed_no_pi_remaining
from application_payments
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and status = 'failed'
  and stripe_payment_intent_id is null;
