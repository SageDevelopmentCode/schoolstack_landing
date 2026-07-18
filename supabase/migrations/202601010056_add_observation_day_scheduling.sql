-- Whole-day shadow / observation scheduling (separate from 30-min visit slots)

create table if not exists public.admissions_observation_day_availability (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  date            date not null,
  created_at      timestamptz not null default now(),
  unique (organization_id, date)
);

create index if not exists admissions_observation_day_availability_org_date_idx
  on public.admissions_observation_day_availability (organization_id, date);

alter table public.admissions_observation_day_availability enable row level security;

create policy "Platform admins manage admissions_observation_day_availability"
  on public.admissions_observation_day_availability
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_observation_day_availability"
  on public.admissions_observation_day_availability
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert admissions_observation_day_availability"
  on public.admissions_observation_day_availability
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete admissions_observation_day_availability"
  on public.admissions_observation_day_availability
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

alter table public.admissions_scheduled_visits
  add column if not exists scheduling_mode text not null default 'time_slot'
    check (scheduling_mode in ('time_slot', 'whole_day')),
  add column if not exists visit_day_count int
    check (visit_day_count is null or visit_day_count > 0),
  add column if not exists end_date date;

create table if not exists public.admissions_scheduled_visit_days (
  id                 uuid primary key default gen_random_uuid(),
  scheduled_visit_id uuid not null references public.admissions_scheduled_visits(id) on delete cascade,
  organization_id    uuid not null references public.organizations(id) on delete cascade,
  date               date not null,
  created_at         timestamptz not null default now(),
  unique (organization_id, date)
);

create index if not exists admissions_scheduled_visit_days_visit_idx
  on public.admissions_scheduled_visit_days (scheduled_visit_id);

create index if not exists admissions_scheduled_visit_days_org_date_idx
  on public.admissions_scheduled_visit_days (organization_id, date);

alter table public.admissions_scheduled_visit_days enable row level security;

create policy "Platform admins manage admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can read own admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admissions_scheduled_visits v
      join public.applications a on a.id = v.application_id
      where v.id = scheduled_visit_id
        and (
          a.created_by_user_id = auth.uid()
          or (
            a.family_id is not null
            and public.user_is_guardian_for_family(a.family_id)
          )
        )
    )
  );
