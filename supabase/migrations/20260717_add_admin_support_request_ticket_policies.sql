-- Ticket workflow for admin support requests (platform admin dashboard).
-- Safe to run in Supabase SQL editor if this migration was not applied yet.
--
-- If you hit a deadlock (40P01): stop your local dev server, run each
-- statement below ONE AT A TIME, and wait for each to finish before the next.

-- Step 1
alter table public.admin_support_requests
  add column if not exists updated_at timestamptz not null default now();

-- Step 2
alter table public.admin_support_requests
  drop constraint if exists admin_support_requests_status_check;

-- Step 3
alter table public.admin_support_requests
  add constraint admin_support_requests_status_check
  check (status in ('open', 'in_progress', 'completed', 'cancelled'));

-- Step 4
drop trigger if exists on_admin_support_requests_updated on public.admin_support_requests;

-- Step 5
create trigger on_admin_support_requests_updated
  before update on public.admin_support_requests
  for each row execute procedure public.handle_updated_at();

-- Step 6
drop policy if exists "Platform admins update support requests"
  on public.admin_support_requests;

-- Step 7
create policy "Platform admins update support requests"
  on public.admin_support_requests
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Step 8
create index if not exists admin_support_requests_status_idx
  on public.admin_support_requests (status);
