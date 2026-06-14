-- Admin profiles linked to auth.users + role-based RLS for internal tools
-- Run in Supabase SQL editor after enabling Supabase Auth.

-- ── Profiles table ────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ── Admin check helper ────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Profiles policies ─────────────────────────────────────────────────────────

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- ── Schools: replace open access with admin-only ──────────────────────────────

drop policy if exists "Allow all access" on public.schools;

create policy "Admins can select schools"
  on public.schools for select to authenticated
  using (public.is_admin());

create policy "Admins can insert schools"
  on public.schools for insert to authenticated
  with check (public.is_admin());

create policy "Admins can update schools"
  on public.schools for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete schools"
  on public.schools for delete to authenticated
  using (public.is_admin());

-- ── Demo requests: admin read/update ──────────────────────────────────────────

create policy "Admins can read demo requests"
  on public.demo_requests
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update demo requests"
  on public.demo_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Demo feedback: admin read ─────────────────────────────────────────────────

create policy "Admins can read demo feedback"
  on public.demo_feedback
  for select
  to authenticated
  using (public.is_admin());
