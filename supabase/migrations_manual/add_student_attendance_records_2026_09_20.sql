-- Promoted to supabase/migrations/20261011_add_student_attendance_records.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Student authorized pickup contacts + daily attendance records
-- Run after: 20261010_restrict_classroom_signup_response_guardian_writes.sql

create table if not exists public.student_authorized_pickup_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  relationship text,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_by_guardian_id uuid references public.guardians(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_authorized_pickup_contacts_student_active_idx
  on public.student_authorized_pickup_contacts (student_id, is_active);

create index if not exists student_authorized_pickup_contacts_org_student_idx
  on public.student_authorized_pickup_contacts (organization_id, student_id);

create index if not exists student_authorized_pickup_contacts_family_idx
  on public.student_authorized_pickup_contacts (family_id);

drop trigger if exists on_student_authorized_pickup_contacts_updated on public.student_authorized_pickup_contacts;
create trigger on_student_authorized_pickup_contacts_updated
  before update on public.student_authorized_pickup_contacts
  for each row execute procedure public.handle_updated_at();

alter table public.student_authorized_pickup_contacts enable row level security;

create policy "Platform admins manage student_authorized_pickup_contacts"
  on public.student_authorized_pickup_contacts for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage student_authorized_pickup_contacts"
  on public.student_authorized_pickup_contacts for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians read student_authorized_pickup_contacts for own students"
  on public.student_authorized_pickup_contacts for select to authenticated
  using (public.user_is_guardian_for_student(student_id));

create policy "Guardians insert student_authorized_pickup_contacts for own students"
  on public.student_authorized_pickup_contacts for insert to authenticated
  with check (public.user_is_guardian_for_student(student_id));

create policy "Guardians update student_authorized_pickup_contacts for own students"
  on public.student_authorized_pickup_contacts for update to authenticated
  using (public.user_is_guardian_for_student(student_id))
  with check (public.user_is_guardian_for_student(student_id));

create policy "Guardians delete student_authorized_pickup_contacts for own students"
  on public.student_authorized_pickup_contacts for delete to authenticated
  using (public.user_is_guardian_for_student(student_id));

create table if not exists public.student_attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'picked_up')),
  present_at timestamptz,
  absent_at timestamptz,
  picked_up_at timestamptz,
  picked_up_by_guardian_id uuid references public.guardians(id) on delete set null,
  picked_up_by_authorized_contact_id uuid references public.student_authorized_pickup_contacts(id) on delete set null,
  picked_up_by_name text,
  recorded_by_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create index if not exists student_attendance_records_org_date_idx
  on public.student_attendance_records (organization_id, attendance_date);

create index if not exists student_attendance_records_family_date_idx
  on public.student_attendance_records (family_id, attendance_date);

create index if not exists student_attendance_records_student_date_idx
  on public.student_attendance_records (student_id, attendance_date desc);

drop trigger if exists on_student_attendance_records_updated on public.student_attendance_records;
create trigger on_student_attendance_records_updated
  before update on public.student_attendance_records
  for each row execute procedure public.handle_updated_at();

alter table public.student_attendance_records enable row level security;

create policy "Platform admins manage student_attendance_records"
  on public.student_attendance_records for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage student_attendance_records"
  on public.student_attendance_records for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians read student_attendance_records for own students"
  on public.student_attendance_records for select to authenticated
  using (public.user_is_guardian_for_student(student_id));
