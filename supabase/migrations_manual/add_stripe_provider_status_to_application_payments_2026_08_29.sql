-- Promoted to supabase/migrations/20260833_add_stripe_provider_status_to_application_payments.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table application_payments
  add column if not exists stripe_provider_status text;
