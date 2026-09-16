-- Promoted to supabase/migrations/20261001_add_message_broadcast_deliveries.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.message_broadcast_deliveries (
  id                 uuid primary key default gen_random_uuid(),
  broadcast_batch_id uuid not null,
  organization_id    uuid not null references public.organizations(id) on delete cascade,
  guardian_id        uuid not null references public.guardians(id) on delete cascade,
  thread_id          uuid not null references public.message_threads(id) on delete cascade,
  message_id         uuid not null references public.portal_messages(id) on delete cascade,
  created_at         timestamptz not null default now(),

  unique (broadcast_batch_id, guardian_id)
);

create index if not exists message_broadcast_deliveries_batch_id_idx
  on public.message_broadcast_deliveries (broadcast_batch_id);

create index if not exists message_broadcast_deliveries_org_id_idx
  on public.message_broadcast_deliveries (organization_id);

alter table public.message_broadcast_deliveries enable row level security;

drop policy if exists "Platform admins manage message_broadcast_deliveries"
  on public.message_broadcast_deliveries;

create policy "Platform admins manage message_broadcast_deliveries"
  on public.message_broadcast_deliveries for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage message_broadcast_deliveries"
  on public.message_broadcast_deliveries;

create policy "Org admins manage message_broadcast_deliveries"
  on public.message_broadcast_deliveries for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
