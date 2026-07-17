-- Admin support requests from school admin dashboard "Need help?" modal.
-- Safe to run in Supabase SQL editor if this migration was not applied yet.

create table if not exists public.admin_support_requests (
  id                    uuid primary key default gen_random_uuid(),

  organization_id       uuid not null references public.organizations(id) on delete cascade,
  organization_slug     text not null,
  organization_name     text not null,

  submitted_by_user_id  uuid not null references auth.users(id) on delete cascade,
  submitter_email       text not null,

  topic                 text not null,
  subject               text,
  description           text not null,
  source_page_path      text,

  attachments           jsonb not null default '[]'::jsonb,
  status                text not null default 'open',

  created_at            timestamptz not null default now()
);

alter table public.admin_support_requests enable row level security;

create policy "Org admins can submit support requests"
  on public.admin_support_requests
  for insert
  to authenticated
  with check (
    public.user_is_org_admin(organization_id)
    and submitted_by_user_id = auth.uid()
  );

create policy "Platform admins read support requests"
  on public.admin_support_requests
  for select
  to authenticated
  using (public.is_platform_admin());

create index if not exists admin_support_requests_organization_id_idx
  on public.admin_support_requests (organization_id);

create index if not exists admin_support_requests_created_at_idx
  on public.admin_support_requests (created_at desc);

-- Private bucket for support request attachments.
-- Path layout: {organization_id}/support-requests/{request_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-support-files',
  'admin-support-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
