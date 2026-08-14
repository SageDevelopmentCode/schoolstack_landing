-- Shadow day observation slots (grade/time flexibility)
-- Run after: 20260819_add_staff_profile_photos.sql

alter table public.organization_settings
  add column if not exists admissions jsonb not null default '{}'::jsonb;

create table if not exists public.admissions_observation_slots (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  date            date not null,
  start_time      text not null default 'ALL_DAY',
  end_time        text,
  label           text,
  created_at      timestamptz not null default now(),
  unique (organization_id, date, start_time, end_time)
);

create index if not exists admissions_observation_slots_org_date_idx
  on public.admissions_observation_slots (organization_id, date);

create table if not exists public.admissions_observation_slot_grades (
  id           uuid primary key default gen_random_uuid(),
  slot_id      uuid not null references public.admissions_observation_slots(id) on delete cascade,
  grade_value  text not null,
  created_at   timestamptz not null default now(),
  unique (slot_id, grade_value)
);

create index if not exists admissions_observation_slot_grades_slot_idx
  on public.admissions_observation_slot_grades (slot_id);

alter table public.admissions_observation_slots enable row level security;
alter table public.admissions_observation_slot_grades enable row level security;

create policy "Platform admins manage admissions_observation_slots"
  on public.admissions_observation_slots
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_observation_slots"
  on public.admissions_observation_slots
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert admissions_observation_slots"
  on public.admissions_observation_slots
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update admissions_observation_slots"
  on public.admissions_observation_slots
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete admissions_observation_slots"
  on public.admissions_observation_slots
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

create policy "Platform admins manage admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admissions_observation_slots s
      where s.id = slot_id
        and public.user_is_active_org_member(s.organization_id)
    )
  );

create policy "Org admins manage admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admissions_observation_slots s
      where s.id = slot_id
        and public.user_is_org_admin(s.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.admissions_observation_slots s
      where s.id = slot_id
        and public.user_is_org_admin(s.organization_id)
    )
  );

alter table public.admissions_scheduled_visit_days
  add column if not exists observation_slot_id uuid references public.admissions_observation_slots(id) on delete set null;

alter table public.admissions_scheduled_visit_days
  drop constraint if exists admissions_scheduled_visit_days_organization_id_date_key;

create unique index if not exists admissions_scheduled_visit_days_observation_slot_id_key
  on public.admissions_scheduled_visit_days (observation_slot_id)
  where observation_slot_id is not null;

-- Backfill whole-day slots from legacy availability table
insert into public.admissions_observation_slots (organization_id, date, start_time, end_time)
select organization_id, date, 'ALL_DAY', null
from public.admissions_observation_day_availability
on conflict (organization_id, date, start_time, end_time) do nothing;

-- Link existing visit days to migrated slots
update public.admissions_scheduled_visit_days vd
set observation_slot_id = s.id
from public.admissions_observation_slots s
where vd.observation_slot_id is null
  and s.organization_id = vd.organization_id
  and s.date = vd.date
  and s.start_time = 'ALL_DAY'
  and s.end_time is null;
