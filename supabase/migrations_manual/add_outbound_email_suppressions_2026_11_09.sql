-- Promoted to supabase/migrations/20261109_outbound_email_suppressions.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.outbound_email_suppressions (
  email text primary key,
  status text not null check (status in ('unsubscribed', 'whitelisted')),
  unsubscribed_at timestamptz,
  whitelisted_at timestamptz,
  source text not null check (source in ('link', 'admin')),
  notes text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outbound_email_suppressions_status_idx
  on public.outbound_email_suppressions (status);

alter table public.outbound_email_suppressions enable row level security;

drop policy if exists "Platform admins manage outbound_email_suppressions"
  on public.outbound_email_suppressions;

create policy "Platform admins manage outbound_email_suppressions"
  on public.outbound_email_suppressions
  for all
  using (public.is_admin())
  with check (public.is_admin());
