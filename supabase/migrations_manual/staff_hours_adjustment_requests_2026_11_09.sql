-- Promoted to supabase/migrations/20261158_add_staff_hours_adjustment_requests.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Teacher hour adjustments that can wait for school admin approval.

create table if not exists public.staff_hours_adjustment_requests (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  staff_member_id       uuid not null references public.staff_members(id) on delete cascade,
  work_date             date not null,
  status                text not null check (status in ('pending', 'approved', 'denied')),
  note                  text,
  proposed_sessions     jsonb not null,
  previous_sessions     jsonb not null default '[]'::jsonb,
  submitted_by_user_id  uuid references auth.users(id) on delete set null,
  reviewed_by_user_id   uuid references auth.users(id) on delete set null,
  reviewed_at           timestamptz,
  admin_email_sent_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists staff_hours_adjustment_requests_org_created_idx
  on public.staff_hours_adjustment_requests (organization_id, created_at desc);

create unique index if not exists staff_hours_adjustment_requests_one_pending_idx
  on public.staff_hours_adjustment_requests (organization_id, staff_member_id, work_date)
  where status = 'pending';

drop trigger if exists on_staff_hours_adjustment_requests_updated
  on public.staff_hours_adjustment_requests;
create trigger on_staff_hours_adjustment_requests_updated
  before update on public.staff_hours_adjustment_requests
  for each row execute procedure public.handle_updated_at();

alter table public.staff_hours_adjustment_requests enable row level security;

drop policy if exists "Platform admins manage staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests;
create policy "Platform admins manage staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests;
create policy "Org admins manage staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read own staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests;
create policy "Staff read own staff_hours_adjustment_requests"
  on public.staff_hours_adjustment_requests for select to authenticated
  using (
    staff_member_id = public.user_staff_member_id_for_org(organization_id)
  );

revoke insert, update, delete on public.staff_hours_adjustment_requests from anon, authenticated;
