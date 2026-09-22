-- Committee message attachments + storage bucket
-- Run after: 20261017_add_committee_join_request_staff_member.sql

alter table public.committee_messages
  drop constraint if exists committee_messages_body_not_empty;

alter table public.committee_messages
  add constraint committee_messages_body_not_empty
  check (char_length(trim(body)) > 0 or body = '');

create table if not exists public.committee_message_attachments (
  id               uuid primary key default gen_random_uuid(),
  message_id       uuid not null references public.committee_messages(id) on delete cascade,
  committee_id     uuid not null references public.committees(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  file_name        text not null,
  storage_path     text not null,
  mime_type        text,
  size_bytes       bigint,
  created_at       timestamptz not null default now()
);

create index if not exists committee_message_attachments_message_id_idx
  on public.committee_message_attachments (message_id);

create index if not exists committee_message_attachments_committee_id_idx
  on public.committee_message_attachments (committee_id);

alter table public.committee_message_attachments enable row level security;

create policy "Platform admins manage committee_message_attachments"
  on public.committee_message_attachments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage committee_message_attachments"
  on public.committee_message_attachments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Committee members read committee_message_attachments"
  on public.committee_message_attachments for select to authenticated
  using (public.user_is_committee_member(committee_id));

create policy "Committee members insert committee_message_attachments"
  on public.committee_message_attachments for insert to authenticated
  with check (public.user_is_committee_member(committee_id));

-- Private bucket for committee message attachments.
-- Path: {organization_id}/committee-messages/{committee_id}/{message_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'committee-message-files',
  'committee-message-files',
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

create or replace function public.committee_message_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.committee_message_storage_committee_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Platform admins manage committee-message-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'committee-message-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'committee-message-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage committee-message-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'committee-message-files'
    and public.user_is_org_admin(public.committee_message_storage_org_id(name))
  )
  with check (
    bucket_id = 'committee-message-files'
    and (storage.foldername(name))[2] = 'committee-messages'
    and public.user_is_org_admin(public.committee_message_storage_org_id(name))
  );

create policy "Staff read committee-message-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'committee-message-files'
    and public.user_is_staff_org_member(public.committee_message_storage_org_id(name))
  );

create policy "Committee members read committee-message-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'committee-message-files'
    and public.user_is_committee_member(
      public.committee_message_storage_committee_id(name)
    )
  );

create policy "Committee members upload committee-message-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'committee-message-files'
    and (storage.foldername(name))[2] = 'committee-messages'
    and public.user_is_committee_member(
      public.committee_message_storage_committee_id(name)
    )
  );
