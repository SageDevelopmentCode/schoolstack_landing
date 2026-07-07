-- Parent post-submit visit bookings (campus tour, interview, observation day)
create table if not exists public.admissions_scheduled_visits (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  application_id        uuid not null references public.applications(id) on delete cascade,
  post_submit_action_id text not null,
  action_type           text not null
    check (action_type in (
      'schedule_campus_tour',
      'schedule_family_interview',
      'schedule_observation_day'
    )),
  scheduled_date        date not null,
  start_time_slot       text not null,
  duration_minutes      int not null check (duration_minutes > 0),
  status                text not null default 'scheduled'
    check (status in ('scheduled', 'cancelled')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (application_id, post_submit_action_id)
);

create index if not exists admissions_scheduled_visits_org_date_idx
  on public.admissions_scheduled_visits (organization_id, scheduled_date);

create index if not exists admissions_scheduled_visits_application_idx
  on public.admissions_scheduled_visits (application_id);

alter table public.admissions_scheduled_visits enable row level security;

create policy "Platform admins manage admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can read own admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          a.created_by_user_id = auth.uid()
          or (
            a.family_id is not null
            and public.user_is_guardian_for_family(a.family_id)
          )
        )
    )
  );

create policy "Guardians can insert own admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for insert
  to authenticated
  with check (
    status = 'scheduled'
    and exists (
      select 1
      from public.applications a
      where a.id = application_id
        and a.status <> 'draft'
        and (
          a.created_by_user_id = auth.uid()
          or (
            a.family_id is not null
            and public.user_is_guardian_for_family(a.family_id)
          )
        )
    )
  );
