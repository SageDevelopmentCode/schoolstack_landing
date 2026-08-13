-- Family-level pre-application tour bookings (before an application exists).
-- Run after: 20260816_add_application_form_version_revisions.sql

alter table public.admissions_scheduled_visits
  alter column application_id drop not null;

alter table public.admissions_scheduled_visits
  add column if not exists family_id uuid references public.families(id) on delete cascade;

alter table public.admissions_scheduled_visits
  drop constraint if exists admissions_scheduled_visits_owner_check;

alter table public.admissions_scheduled_visits
  add constraint admissions_scheduled_visits_owner_check
  check (application_id is not null or family_id is not null);

alter table public.admissions_scheduled_visits
  drop constraint if exists admissions_scheduled_visits_application_id_post_submit_action_id_key;

drop index if exists admissions_scheduled_visits_application_action_uidx;

create unique index if not exists admissions_scheduled_visits_application_action_uidx
  on public.admissions_scheduled_visits (application_id, post_submit_action_id)
  where application_id is not null;

create unique index if not exists admissions_scheduled_visits_family_pre_app_uidx
  on public.admissions_scheduled_visits (organization_id, family_id, action_type)
  where application_id is null and family_id is not null;

create index if not exists admissions_scheduled_visits_family_idx
  on public.admissions_scheduled_visits (family_id)
  where family_id is not null;

drop policy if exists "Guardians can read own admissions_scheduled_visits" on public.admissions_scheduled_visits;

create policy "Guardians can read own admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for select
  to authenticated
  using (
    (
      family_id is not null
      and public.user_is_guardian_for_family(family_id)
    )
    or exists (
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

drop policy if exists "Guardians can insert own admissions_scheduled_visits" on public.admissions_scheduled_visits;

create policy "Guardians can insert own admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for insert
  to authenticated
  with check (
    status = 'scheduled'
    and (
      (
        family_id is not null
        and application_id is null
        and public.user_is_guardian_for_family(family_id)
      )
      or exists (
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
    )
  );
