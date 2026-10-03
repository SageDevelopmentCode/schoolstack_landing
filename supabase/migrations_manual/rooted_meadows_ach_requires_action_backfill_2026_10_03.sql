-- Rooted Meadows: Hayley Calvert ACH tuition (Sep + Oct 2026) — Stripe micro-deposit verification pending.
-- Run in Supabase SQL Editor after confirming PaymentIntents are still requires_action in Stripe.
-- Idempotent: only updates rows still marked processing (or null) on succeeded ACH tuition payments.

update application_payments
set stripe_provider_status = 'requires_action'
where id in (
  '040a76f7-06bf-4f80-962d-ff0154b873ba',
  'ea94f4ad-984b-4518-92d5-2a9b9c9f4edb'
)
  and payment_method_type = 'us_bank_account'
  and status = 'succeeded'
  and payment_type = 'tuition'
  and (stripe_provider_status is null or stripe_provider_status = 'processing');
