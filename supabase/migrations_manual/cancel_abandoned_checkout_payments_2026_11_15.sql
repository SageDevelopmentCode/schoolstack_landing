-- One-off: mark abandoned Stripe Checkout attempts as canceled.
-- Run after: application_payments_canceled_status_2026_11_15.sql
--
-- Every click on Pay inserted pending application_payments rows before the
-- payer reached Stripe. If they left Checkout, nothing closed those rows, so
-- they showed as "Pending" next to the later, real payment (e.g. Rooted Meadows,
-- Landeen Supply and Activities Fee, Nov 4 2026).
--
-- A pending row with no PaymentIntent that is older than Checkout's 24h session
-- lifetime can no longer be paid, so it is safe to cancel.

-- Preview:
select organization_id, id, payment_type, label, amount_cents, stripe_checkout_session_id, created_at
from public.application_payments
where status = 'pending'
  and stripe_payment_intent_id is null
  and created_at < now() - interval '24 hours'
order by organization_id, created_at;

update public.application_payments
set status = 'canceled'
where status = 'pending'
  and stripe_payment_intent_id is null
  and created_at < now() - interval '24 hours';
