-- Demo scheduling availability (one row per open slot)
-- Run in Supabase SQL editor if the table does not exist yet.

create table if not exists public.demo_availability_slots (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  time_slot  text not null,  -- e.g. '9:00 AM' (matches UI labels)
  created_at timestamptz not null default now(),
  unique (date, time_slot)
);

create index if not exists demo_availability_slots_date_idx
  on public.demo_availability_slots (date);

alter table public.demo_availability_slots enable row level security;

-- Public read: needed for /get-started availability API
create policy "Anyone can read availability slots"
  on public.demo_availability_slots
  for select
  to anon, authenticated
  using (true);

-- Admin write (reuses existing is_admin() from profiles migration)
create policy "Admins can insert availability slots"
  on public.demo_availability_slots for insert to authenticated
  with check (public.is_admin());

create policy "Admins can delete availability slots"
  on public.demo_availability_slots for delete to authenticated
  using (public.is_admin());

-- Prevent double-booking the same slot
create unique index if not exists demo_requests_active_slot_idx
  on public.demo_requests (scheduled_date, scheduled_time)
  where status = 'scheduled';

-- Optional seed: June 2026 onward from the original static list
insert into public.demo_availability_slots (date, time_slot)
select d::date, t.time_slot
from (
  values
    ('2026-06-02'), ('2026-06-03'), ('2026-06-04'),
    ('2026-06-09'), ('2026-06-10'), ('2026-06-11')
) as dates(d)
cross join (
  values
    ('9:00 AM'), ('9:30 AM'), ('10:00 AM'), ('10:30 AM'), ('11:00 AM'),
    ('2:00 PM'), ('2:30 PM'), ('3:00 PM'), ('3:30 PM'), ('4:00 PM')
) as t(time_slot)
on conflict (date, time_slot) do nothing;
