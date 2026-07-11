-- Pass-through processing fees on application_payments ledger
-- Run after: add_unified_payment_ledger.sql

alter table public.application_payments
  add column if not exists charged_amount_cents integer
    check (charged_amount_cents is null or charged_amount_cents >= 0);

alter table public.application_payments
  add column if not exists processing_fee_cents integer
    check (processing_fee_cents is null or processing_fee_cents >= 0);

alter table public.application_payments
  add column if not exists payment_method_type text
    check (payment_method_type is null or payment_method_type in ('card', 'us_bank_account'));

-- Backfill: historical rows charged the net amount only
update public.application_payments
set
  charged_amount_cents = coalesce(charged_amount_cents, amount_cents),
  processing_fee_cents = coalesce(processing_fee_cents, 0)
where charged_amount_cents is null or processing_fee_cents is null;
