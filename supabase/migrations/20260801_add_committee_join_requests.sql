-- Committee join requests + parent portal RLS
-- Run after: 20260728_add_committees_rls.sql

-- ── Helper: enrolled parent access ───────────────────────────────────────────

create or replace function public.user_has_enrolled_parent_access(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardians g
    join public.families f on f.id = g.family_id
    join public.students s on s.family_id = f.id
    join public.enrollments e on e.student_id = s.id
    where g.user_id = auth.uid()
      and f.organization_id = p_organization_id
      and e.organization_id = p_organization_id
      and e.status = 'enrolled'
  );
$$;

-- ── committee_join_requests ──────────────────────────────────────────────────

create table if not exists public.committee_join_requests (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references public.organizations(id) on delete cascade,
  committee_id            uuid not null references public.committees(id) on delete cascade,
  user_id                 uuid not null references auth.users(id) on delete cascade,
  guardian_id             uuid references public.guardians(id) on delete set null,
  preferred_duty_role_id  uuid references public.committee_duty_roles(id) on delete set null,
  grade                   text,
  note                    text,
  status                  text not null default 'pending'
                            check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  reviewed_by             uuid references auth.users(id) on delete set null,
  reviewed_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists committee_join_requests_organization_id_idx
  on public.committee_join_requests (organization_id);

create index if not exists committee_join_requests_committee_id_idx
  on public.committee_join_requests (committee_id);

create index if not exists committee_join_requests_user_id_idx
  on public.committee_join_requests (user_id);

create unique index if not exists committee_join_requests_pending_user_committee_idx
  on public.committee_join_requests (user_id, committee_id)
  where status = 'pending';

drop trigger if exists on_committee_join_requests_updated on public.committee_join_requests;
create trigger on_committee_join_requests_updated
  before update on public.committee_join_requests
  for each row execute procedure public.handle_updated_at();

-- ── committee_join_requests RLS ──────────────────────────────────────────────

alter table public.committee_join_requests enable row level security;

create policy "Platform admins manage committee_join_requests"
  on public.committee_join_requests for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage committee_join_requests"
  on public.committee_join_requests for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Parents read own committee_join_requests"
  on public.committee_join_requests for select to authenticated
  using (user_id = auth.uid());

create policy "Parents create own pending committee_join_requests"
  on public.committee_join_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and public.user_has_enrolled_parent_access(organization_id)
  );

create policy "Parents withdraw own pending committee_join_requests"
  on public.committee_join_requests for update to authenticated
  using (
    user_id = auth.uid()
    and status = 'pending'
  )
  with check (
    user_id = auth.uid()
    and status in ('pending', 'withdrawn')
  );

-- ── Parent read policies on existing committee tables ──────────────────────────

create policy "Enrolled parents read active committees"
  on public.committees for select to authenticated
  using (
    status = 'active'
    and public.user_has_enrolled_parent_access(organization_id)
  );

create policy "Enrolled parents read committee_duty_roles"
  on public.committee_duty_roles for select to authenticated
  using (
    public.user_has_enrolled_parent_access(public.committee_organization_id(committee_id))
  );

create policy "Parents read own committee_members"
  on public.committee_members for select to authenticated
  using (user_id = auth.uid());

create policy "Committee members read committee_tasks"
  on public.committee_tasks for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members read committee_events"
  on public.committee_events for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members read committee_resources"
  on public.committee_resources for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members read committee_messages"
  on public.committee_messages for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members read peer committee_members"
  on public.committee_members for select to authenticated
  using (public.user_is_committee_member(committee_id));
