-- Per-teacher read watermark for teacher portal activity notifications.
-- Run after: 20260921_waive_tuition_charge_atomic.sql

create table if not exists public.teacher_activity_notification_reads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  last_read_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (user_id, organization_id)
);

create index if not exists teacher_activity_notification_reads_user_org_idx
  on public.teacher_activity_notification_reads (user_id, organization_id);

drop trigger if exists on_teacher_activity_notification_reads_updated
  on public.teacher_activity_notification_reads;

create trigger on_teacher_activity_notification_reads_updated
  before update on public.teacher_activity_notification_reads
  for each row execute procedure public.handle_updated_at();

alter table public.teacher_activity_notification_reads enable row level security;

drop policy if exists "Teachers read own activity notification watermarks"
  on public.teacher_activity_notification_reads;

create policy "Teachers read own activity notification watermarks"
  on public.teacher_activity_notification_reads
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.organization_memberships om
      where om.user_id = auth.uid()
        and om.organization_id = teacher_activity_notification_reads.organization_id
        and om.status = 'active'
        and om.role in ('teacher', 'staff')
    )
  );

drop policy if exists "Teachers insert own activity notification watermarks"
  on public.teacher_activity_notification_reads;

create policy "Teachers insert own activity notification watermarks"
  on public.teacher_activity_notification_reads
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.organization_memberships om
      where om.user_id = auth.uid()
        and om.organization_id = teacher_activity_notification_reads.organization_id
        and om.status = 'active'
        and om.role in ('teacher', 'staff')
    )
  );

drop policy if exists "Teachers update own activity notification watermarks"
  on public.teacher_activity_notification_reads;

create policy "Teachers update own activity notification watermarks"
  on public.teacher_activity_notification_reads
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.organization_memberships om
      where om.user_id = auth.uid()
        and om.organization_id = teacher_activity_notification_reads.organization_id
        and om.status = 'active'
        and om.role in ('teacher', 'staff')
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.organization_memberships om
      where om.user_id = auth.uid()
        and om.organization_id = teacher_activity_notification_reads.organization_id
        and om.status = 'active'
        and om.role in ('teacher', 'staff')
    )
  );
