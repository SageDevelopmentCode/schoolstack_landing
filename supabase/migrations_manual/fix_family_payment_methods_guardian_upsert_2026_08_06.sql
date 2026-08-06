-- Promoted to supabase/migrations/20260804_fix_family_payment_methods_guardian_upsert.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Fix ON CONFLICT inference for guardian payment method upserts.

drop index if exists public.family_payment_methods_billing_guardian_key;

create unique index if not exists family_payment_methods_billing_guardian_key
  on public.family_payment_methods (billing_account_id, guardian_id);
