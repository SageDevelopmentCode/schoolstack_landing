-- Promoted to supabase/migrations/20260910_add_program_coop_teaching_schedule.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-10

create table if not exists public.program_coop_teaching_schedule_weeks (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid not null references public.programs(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  start_date        date not null,
  end_date          date not null,
  parent_instructor text not null default '',
  parent_assistant  text,
  week_name         text not null default '',
  seasonal_theme    text not null default '',
  character_lesson  text not null default '',
  celebration_event text,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists program_coop_teaching_schedule_weeks_program_id_idx
  on public.program_coop_teaching_schedule_weeks (program_id);

create index if not exists program_coop_teaching_schedule_weeks_organization_id_idx
  on public.program_coop_teaching_schedule_weeks (organization_id);

create index if not exists program_coop_teaching_schedule_weeks_program_id_sort_order_idx
  on public.program_coop_teaching_schedule_weeks (program_id, sort_order);

drop trigger if exists on_program_coop_teaching_schedule_weeks_updated
  on public.program_coop_teaching_schedule_weeks;
create trigger on_program_coop_teaching_schedule_weeks_updated
  before update on public.program_coop_teaching_schedule_weeks
  for each row execute procedure public.handle_updated_at();

alter table public.program_coop_teaching_schedule_weeks enable row level security;

drop policy if exists "Platform admins manage program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks;
create policy "Platform admins manage program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks;
create policy "Org admins manage program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks;
create policy "Staff read program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Enrolled guardians read program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks;
create policy "Enrolled guardians read program_coop_teaching_schedule_weeks"
  on public.program_coop_teaching_schedule_weeks for select to authenticated
  using (public.user_can_read_program_coop_curriculum(program_id));
