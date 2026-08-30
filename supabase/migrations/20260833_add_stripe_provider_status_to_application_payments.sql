-- Stripe settlement status for ops/debugging (entitlements use application_payments.status).
-- Run after: 20260832_drop_org_admin_support_request_read_policy.sql

alter table application_payments
  add column if not exists stripe_provider_status text;
