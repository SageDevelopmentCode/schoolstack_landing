-- Per-admin read watermark for school admin activity notifications.
-- Run after: 20260834_add_organization_notifications.sql

create table if not exists public.school_admin_activity_notification_reads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  last_read_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (user_id, organization_id)
);

create index if not exists school_admin_activity_notification_reads_user_org_idx
  on public.school_admin_activity_notification_reads (user_id, organization_id);

drop trigger if exists on_school_admin_activity_notification_reads_updated
  on public.school_admin_activity_notification_reads;

create trigger on_school_admin_activity_notification_reads_updated
  before update on public.school_admin_activity_notification_reads
  for each row execute procedure public.handle_updated_at();

alter table public.school_admin_activity_notification_reads enable row level security;

drop policy if exists "Users read own activity notification watermarks"
  on public.school_admin_activity_notification_reads;

create policy "Users read own activity notification watermarks"
  on public.school_admin_activity_notification_reads
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.user_is_org_admin(organization_id)
  );

drop policy if exists "Users insert own activity notification watermarks"
  on public.school_admin_activity_notification_reads;

create policy "Users insert own activity notification watermarks"
  on public.school_admin_activity_notification_reads
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.user_is_org_admin(organization_id)
  );

drop policy if exists "Users update own activity notification watermarks"
  on public.school_admin_activity_notification_reads;

create policy "Users update own activity notification watermarks"
  on public.school_admin_activity_notification_reads
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.user_is_org_admin(organization_id)
  )
  with check (
    user_id = auth.uid()
    and public.user_is_org_admin(organization_id)
  );
