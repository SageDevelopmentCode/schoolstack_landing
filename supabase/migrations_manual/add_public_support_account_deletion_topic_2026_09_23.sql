-- Promoted to supabase/migrations/20261028_add_public_support_account_deletion_topic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.public_support_requests
  drop constraint if exists public_support_requests_topic_check;

alter table public.public_support_requests
  add constraint public_support_requests_topic_check
  check (topic in (
    'general',
    'bug',
    'billing',
    'feature',
    'account-deletion',
    'other'
  ));
