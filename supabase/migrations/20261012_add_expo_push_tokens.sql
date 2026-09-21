-- Expo push tokens for MudKitchen mobile app message notifications
-- Run after: 20261011_add_student_attendance_records.sql

create table if not exists public.expo_push_tokens (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid references public.organizations(id) on delete cascade,
  push_token       text not null,
  platform         text check (platform in ('ios', 'android')),
  updated_at       timestamptz not null default now()
);

create index if not exists expo_push_tokens_organization_id_idx
  on public.expo_push_tokens (organization_id)
  where organization_id is not null;

create index if not exists expo_push_tokens_push_token_idx
  on public.expo_push_tokens (push_token)
  where push_token is not null;

alter table public.expo_push_tokens enable row level security;

create policy "Users manage own expo_push_tokens"
  on public.expo_push_tokens for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Platform admins manage expo_push_tokens"
  on public.expo_push_tokens for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
