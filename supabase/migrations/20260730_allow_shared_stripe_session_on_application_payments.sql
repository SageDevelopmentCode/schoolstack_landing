-- Combined enrollment payments: multiple ledger rows may share one Stripe session/PI.

alter table public.application_payments
  drop constraint if exists application_payments_stripe_checkout_session_id_key;

alter table public.application_payments
  drop constraint if exists application_payments_stripe_payment_intent_id_key;

create index if not exists application_payments_stripe_checkout_session_id_idx
  on public.application_payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists application_payments_stripe_payment_intent_id_idx
  on public.application_payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
