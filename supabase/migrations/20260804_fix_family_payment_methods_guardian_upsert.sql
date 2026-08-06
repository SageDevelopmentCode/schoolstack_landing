-- Fix ON CONFLICT inference for guardian payment method upserts.
-- Run after: 20260803_guardian_read_tuition_payments.sql

drop index if exists public.family_payment_methods_billing_guardian_key;

create unique index if not exists family_payment_methods_billing_guardian_key
  on public.family_payment_methods (billing_account_id, guardian_id);
