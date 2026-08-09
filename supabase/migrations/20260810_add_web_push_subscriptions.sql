-- Web push subscriptions for portal message notifications
-- Run after: 20260809_add_portal_message_attachments.sql

create table if not exists public.web_push_subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  organization_id  uuid references public.organizations(id) on delete cascade,
  endpoint         text not null,
  p256dh           text not null,
  auth             text not null,
  user_agent       text,
  created_at       timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists web_push_subscriptions_user_id_idx
  on public.web_push_subscriptions (user_id);

create index if not exists web_push_subscriptions_organization_id_idx
  on public.web_push_subscriptions (organization_id)
  where organization_id is not null;

alter table public.web_push_subscriptions enable row level security;

create policy "Users manage own web_push_subscriptions"
  on public.web_push_subscriptions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Platform admins manage web_push_subscriptions"
  on public.web_push_subscriptions for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
