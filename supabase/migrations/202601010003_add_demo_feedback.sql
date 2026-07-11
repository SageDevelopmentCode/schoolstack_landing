-- Demo feedback submissions from school demo walkthrough contact forms
-- Run in Supabase SQL editor if the table does not exist yet.

create table if not exists public.demo_feedback (
  id           uuid primary key default gen_random_uuid(),

  -- Which school demo this came from
  school_slug  text not null,
  school_name  text not null,

  -- Contact
  name         text not null,
  email        text not null,
  message      text not null,

  -- Metadata
  source       text not null default 'demo-walkthrough',
  created_at   timestamptz not null default now()
);

alter table public.demo_feedback enable row level security;

-- Public site: allow submissions only (no reads/updates from anon)
create policy "Anyone can submit demo feedback"
  on public.demo_feedback
  for insert
  to anon, authenticated
  with check (true);

create index if not exists demo_feedback_created_at_idx
  on public.demo_feedback (created_at desc);

create index if not exists demo_feedback_school_slug_idx
  on public.demo_feedback (school_slug);
