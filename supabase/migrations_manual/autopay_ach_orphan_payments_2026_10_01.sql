-- 2026-10-01: rooted-meadows autopay run created pending tuition payment rows
-- for 5 ACH charges (Olson, Sparhawk x2, Thompson x2) before Stripe rejected the
-- PaymentIntent (us_bank_account not in allowed payment_method_types). No
-- PaymentIntent was created, so mark the rows failed. Safe to re-run.

update application_payments
set status = 'failed'
where id in (
  '8f6fdda1-0510-4285-8af2-5e3c961b9db4',
  '87c279e6-b9fe-433a-a66d-13d2085d8e96',
  '16a7db5d-7e5a-4243-b0ac-595a0f09b2b7',
  'a59332ed-64e4-4700-b4f0-0d0ed32de715',
  'dd0a5887-2bb8-4b84-ac96-8060eab5eaa8'
)
  and status = 'pending'
  and stripe_payment_intent_id is null;
