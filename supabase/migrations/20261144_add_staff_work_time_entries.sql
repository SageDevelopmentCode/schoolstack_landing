-- Staff work time clock entries (teacher My Hours)
-- Run after: 20261143_replace_committee_project_supply_color_legend_atomic.sql

create table if not exists public.staff_work_time_entries (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  staff_member_id       uuid not null references public.staff_members(id) on delete cascade,
  work_date             date not null,
  clock_in_at           timestamptz not null,
  clock_out_at          timestamptz,
  recorded_by_user_id   uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (clock_out_at is null or clock_out_at > clock_in_at)
);

create index if not exists staff_work_time_entries_org_staff_date_idx
  on public.staff_work_time_entries (organization_id, staff_member_id, work_date);

create index if not exists staff_work_time_entries_staff_clock_in_idx
  on public.staff_work_time_entries (staff_member_id, clock_in_at desc);

create unique index if not exists staff_work_time_entries_one_open_session_idx
  on public.staff_work_time_entries (staff_member_id)
  where clock_out_at is null;

drop trigger if exists on_staff_work_time_entries_updated on public.staff_work_time_entries;
create trigger on_staff_work_time_entries_updated
  before update on public.staff_work_time_entries
  for each row execute procedure public.handle_updated_at();

alter table public.staff_work_time_entries enable row level security;

create policy "Platform admins manage staff_work_time_entries"
  on public.staff_work_time_entries for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage staff_work_time_entries"
  on public.staff_work_time_entries for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Staff read own staff_work_time_entries"
  on public.staff_work_time_entries for select to authenticated
  using (
    staff_member_id = public.user_staff_member_id_for_org(organization_id)
  );

-- Clock in/out uses service_role via API; block PostgREST writes for staff (and all authenticated).
revoke insert, update, delete on public.staff_work_time_entries from anon, authenticated;
