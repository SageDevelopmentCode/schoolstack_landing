-- Classroom signups (teacher-created parent volunteer signups)
-- Run after: 20260839_add_schedule_event_permissions.sql

create table if not exists public.classroom_signups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by_staff_member_id uuid not null references public.staff_members(id) on delete cascade,
  title text not null,
  description text not null default '',
  signup_type text not null check (signup_type in ('time_slots', 'roles', 'open')),
  audience text not null check (audience in ('assigned', 'classroom')),
  classroom_id uuid references public.classrooms(id) on delete set null,
  family_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  response_deadline timestamptz,
  config jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists classroom_signups_org_staff_status_idx
  on public.classroom_signups (organization_id, created_by_staff_member_id, status);

create index if not exists classroom_signups_org_status_published_idx
  on public.classroom_signups (organization_id, status, published_at desc nulls last);

create table if not exists public.classroom_signup_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  signup_id uuid not null references public.classroom_signups(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  selected_slot_ids jsonb not null default '[]'::jsonb,
  selected_role_ids jsonb not null default '[]'::jsonb,
  note text,
  status text not null default 'confirmed' check (status in ('confirmed', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (signup_id, family_id)
);

create index if not exists classroom_signup_responses_signup_idx
  on public.classroom_signup_responses (signup_id);

create index if not exists classroom_signup_responses_family_idx
  on public.classroom_signup_responses (family_id, signup_id);

drop trigger if exists on_classroom_signups_updated on public.classroom_signups;
create trigger on_classroom_signups_updated
  before update on public.classroom_signups
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_classroom_signup_responses_updated on public.classroom_signup_responses;
create trigger on_classroom_signup_responses_updated
  before update on public.classroom_signup_responses
  for each row execute procedure public.handle_updated_at();

alter table public.classroom_signups enable row level security;
alter table public.classroom_signup_responses enable row level security;

create policy "Platform admins manage classroom_signups"
  on public.classroom_signups for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage classroom_signups"
  on public.classroom_signups for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org members read classroom_signups"
  on public.classroom_signups for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Platform admins manage classroom_signup_responses"
  on public.classroom_signup_responses for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage classroom_signup_responses"
  on public.classroom_signup_responses for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians read classroom_signup_responses for own family"
  on public.classroom_signup_responses for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Guardians manage classroom_signup_responses for own family"
  on public.classroom_signup_responses for all to authenticated
  using (public.user_is_guardian_for_family(family_id))
  with check (public.user_is_guardian_for_family(family_id));
