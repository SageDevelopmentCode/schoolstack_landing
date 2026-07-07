-- Admissions visit scheduling: open 30-minute cells per organization
create table if not exists public.admissions_availability_slots (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  date            date not null,
  time_slot       text not null,
  created_at      timestamptz not null default now(),
  unique (organization_id, date, time_slot)
);

create index if not exists admissions_availability_slots_org_date_idx
  on public.admissions_availability_slots (organization_id, date);

alter table public.admissions_availability_slots enable row level security;

create policy "Platform admins manage admissions_availability_slots"
  on public.admissions_availability_slots
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read admissions_availability_slots"
  on public.admissions_availability_slots
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert admissions_availability_slots"
  on public.admissions_availability_slots
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete admissions_availability_slots"
  on public.admissions_availability_slots
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));
