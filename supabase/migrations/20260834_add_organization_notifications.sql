-- Organization-level notification preferences (payment emails, future visit settings)
-- Run after: 20260833_add_stripe_provider_status_to_application_payments.sql

alter table public.organization_settings
  add column if not exists notifications jsonb not null default '{}'::jsonb;
