-- Parent portal feature feedback from authenticated parents on coming-soon pages

create table if not exists public.parent_portal_feedback (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  school_slug      text not null,
  school_name      text not null,
  user_id          uuid not null references auth.users(id) on delete cascade,
  submitter_name   text,
  submitter_email  text,
  feature_key      text not null,
  feature_label    text not null,
  feedback_type    text not null default 'feature_request'
                   check (feedback_type in ('feature_request', 'feedback', 'bug')),
  message          text not null,
  page_path        text,
  created_at       timestamptz not null default now()
);

alter table public.parent_portal_feedback enable row level security;

create policy "Parents can submit portal feedback"
  on public.parent_portal_feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can read portal feedback"
  on public.parent_portal_feedback
  for select
  to authenticated
  using (public.is_admin());

create index if not exists parent_portal_feedback_created_at_idx
  on public.parent_portal_feedback (created_at desc);

create index if not exists parent_portal_feedback_org_idx
  on public.parent_portal_feedback (organization_id, created_at desc);

create index if not exists parent_portal_feedback_feature_idx
  on public.parent_portal_feedback (feature_key, created_at desc);
