-- Promoted to supabase/migrations/20260912_parent_activity_notification_reads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.parent_activity_notification_reads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  last_read_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (user_id, organization_id)
);

create index if not exists parent_activity_notification_reads_user_org_idx
  on public.parent_activity_notification_reads (user_id, organization_id);

drop trigger if exists on_parent_activity_notification_reads_updated
  on public.parent_activity_notification_reads;

create trigger on_parent_activity_notification_reads_updated
  before update on public.parent_activity_notification_reads
  for each row execute procedure public.handle_updated_at();

alter table public.parent_activity_notification_reads enable row level security;

drop policy if exists "Parents read own activity notification watermarks"
  on public.parent_activity_notification_reads;

create policy "Parents read own activity notification watermarks"
  on public.parent_activity_notification_reads
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.user_has_enrolled_parent_access(organization_id)
  );

drop policy if exists "Parents insert own activity notification watermarks"
  on public.parent_activity_notification_reads;

create policy "Parents insert own activity notification watermarks"
  on public.parent_activity_notification_reads
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.user_has_enrolled_parent_access(organization_id)
  );

drop policy if exists "Parents update own activity notification watermarks"
  on public.parent_activity_notification_reads;

create policy "Parents update own activity notification watermarks"
  on public.parent_activity_notification_reads
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.user_has_enrolled_parent_access(organization_id)
  )
  with check (
    user_id = auth.uid()
    and public.user_has_enrolled_parent_access(organization_id)
  );
