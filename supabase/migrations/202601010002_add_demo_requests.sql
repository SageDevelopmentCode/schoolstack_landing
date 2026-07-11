-- Demo request submissions from /get-started
-- Run in Supabase SQL editor if the table does not exist yet.

create table if not exists public.demo_requests (
  id                uuid primary key default gen_random_uuid(),

  -- Contact
  name              text not null,
  email             text not null,
  school_name       text not null,

  -- Qualification
  role              text not null
                      check (role in ('starting','running','private','program','other')),
  launch_timeline   text
                      check (launch_timeline is null or launch_timeline in ('within-3','3-6','6-12','exploring')),
  student_count     text
                      check (student_count is null or student_count in ('0-10','11-25','26-75','76+')),
  current_systems   text not null default '',
  priorities        text[] not null default '{}',

  -- Optional context
  website_url       text not null default '',
  current_tools     text not null default '',
  prep_notes        text not null default '',

  -- Scheduler selection
  scheduled_date    date not null,
  scheduled_time    text not null,
  timezone          text not null default 'America/Chicago',

  -- Metadata
  status            text not null default 'scheduled'
                      check (status in ('scheduled','cancelled','completed')),
  source            text not null default 'get-started',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Reuse existing updated_at trigger if present
drop trigger if exists on_demo_requests_updated on public.demo_requests;
create trigger on_demo_requests_updated
  before update on public.demo_requests
  for each row execute procedure public.handle_updated_at();

alter table public.demo_requests enable row level security;

-- Public site: allow submissions only (no reads/updates from anon)
create policy "Anyone can submit demo request"
  on public.demo_requests
  for insert
  to anon, authenticated
  with check (true);

-- Optional index for inbox sorting
create index if not exists demo_requests_created_at_idx
  on public.demo_requests (created_at desc);
