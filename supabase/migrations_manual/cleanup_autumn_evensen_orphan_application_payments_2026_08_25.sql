-- One-off: remove failed/pending orphan application fee rows for Autumn Evensen.
-- Application: 700bd103-0daa-47d2-8cd9-810029e4db8c (cslewisgal@gmail.com / Rooted Meadows)
-- Keep succeeded payment: efa75009-d382-4a8a-afe2-40c4b56b4263
-- Stripe Checkout sessions for abandoned pending rows were left as-is (optional expire skipped).
-- Idempotent: safe to re-run (deletes 0 rows if already cleaned).
-- Date: 2026-08-25

begin;

delete from public.application_payments
where application_id = '700bd103-0daa-47d2-8cd9-810029e4db8c'
  and id <> 'efa75009-d382-4a8a-afe2-40c4b56b4263'
  and status in ('pending', 'failed');

-- Verify: expect 1 row, status succeeded
select id, status, charged_amount_cents, stripe_payment_intent_id, created_at
from public.application_payments
where application_id = '700bd103-0daa-47d2-8cd9-810029e4db8c'
order by created_at;

commit;
