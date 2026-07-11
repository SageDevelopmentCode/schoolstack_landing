-- Relax demo_feedback for comment-only prototype walkthrough submissions.
-- Safe to run if add_demo_feedback.sql was already applied.

-- Allow anonymous prototype comments (no name/email required)
alter table public.demo_feedback alter column name drop not null;
alter table public.demo_feedback alter column email drop not null;

alter table public.demo_feedback enable row level security;

drop policy if exists "Anyone can submit demo feedback" on public.demo_feedback;
create policy "Anyone can submit demo feedback"
  on public.demo_feedback
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read demo feedback" on public.demo_feedback;
create policy "Admins can read demo feedback"
  on public.demo_feedback
  for select
  to authenticated
  using (public.is_admin());

create index if not exists demo_feedback_created_at_idx
  on public.demo_feedback (created_at desc);

create index if not exists demo_feedback_school_slug_idx
  on public.demo_feedback (school_slug);
