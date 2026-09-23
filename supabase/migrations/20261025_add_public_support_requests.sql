-- Public support requests from the marketing-site /support form.
-- Run after: 20260717_add_admin_support_request_ticket_policies.sql

create table if not exists public.public_support_requests (
  id                 uuid primary key default gen_random_uuid(),

  submitter_name     text not null,
  submitter_email    text not null,
  topic              text not null,
  description        text not null,
  source_page_path   text,

  status             text not null default 'open',

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.public_support_requests
  drop constraint if exists public_support_requests_status_check;

alter table public.public_support_requests
  add constraint public_support_requests_status_check
  check (status in ('open', 'in_progress', 'completed', 'cancelled'));

alter table public.public_support_requests
  drop constraint if exists public_support_requests_topic_check;

alter table public.public_support_requests
  add constraint public_support_requests_topic_check
  check (topic in ('general', 'bug', 'billing', 'feature', 'other'));

drop trigger if exists on_public_support_requests_updated on public.public_support_requests;

create trigger on_public_support_requests_updated
  before update on public.public_support_requests
  for each row execute procedure public.handle_updated_at();

alter table public.public_support_requests enable row level security;

drop policy if exists "Anyone can submit public support requests"
  on public.public_support_requests;

create policy "Anyone can submit public support requests"
  on public.public_support_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Platform admins read public support requests"
  on public.public_support_requests;

create policy "Platform admins read public support requests"
  on public.public_support_requests
  for select
  to authenticated
  using (public.is_platform_admin());

drop policy if exists "Platform admins update public support requests"
  on public.public_support_requests;

create policy "Platform admins update public support requests"
  on public.public_support_requests
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index if not exists public_support_requests_created_at_idx
  on public.public_support_requests (created_at desc);

create index if not exists public_support_requests_status_idx
  on public.public_support_requests (status);
