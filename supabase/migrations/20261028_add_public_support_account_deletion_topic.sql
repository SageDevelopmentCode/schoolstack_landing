-- Allow account-deletion topic on public support requests.
-- Run after: 20261027_lock_public_form_inserts.sql

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
