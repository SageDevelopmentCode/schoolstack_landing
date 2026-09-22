-- Promoted to supabase/migrations/20261013_add_push_notification_deliveries.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: delivery log for MudKitchen mobile Expo push notifications (2026-09-20)

create table if not exists public.push_notification_deliveries (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  recipient_user_id   uuid not null references auth.users(id) on delete cascade,
  recipient_portal    text not null check (recipient_portal in ('parent', 'teacher', 'admin')),
  recipient_email     text,
  channel             text not null check (channel in ('expo_push')),
  status              text not null check (status in ('sent', 'failed', 'skipped_no_token')),
  title               text not null,
  body                text not null,
  thread_id           uuid references public.message_threads(id) on delete set null,
  expo_ticket_id      text,
  error_message       text,
  created_at          timestamptz not null default now()
);

create index if not exists push_notification_deliveries_org_created_idx
  on public.push_notification_deliveries (organization_id, created_at desc);

create index if not exists push_notification_deliveries_recipient_created_idx
  on public.push_notification_deliveries (recipient_user_id, created_at desc);

alter table public.push_notification_deliveries enable row level security;

drop policy if exists "Platform admins read push_notification_deliveries" on public.push_notification_deliveries;
create policy "Platform admins read push_notification_deliveries"
  on public.push_notification_deliveries for select to authenticated
  using (public.is_platform_admin());
