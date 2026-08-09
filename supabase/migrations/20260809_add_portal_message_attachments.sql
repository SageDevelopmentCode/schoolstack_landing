-- Portal message attachments + storage bucket
-- Run after: 20260808_enable_portal_messages_realtime.sql

alter table public.portal_messages
  drop constraint if exists portal_messages_body_not_empty;

alter table public.portal_messages
  add constraint portal_messages_body_not_empty
  check (char_length(trim(body)) > 0 or body = '');

create table if not exists public.portal_message_attachments (
  id               uuid primary key default gen_random_uuid(),
  message_id       uuid not null references public.portal_messages(id) on delete cascade,
  thread_id        uuid not null references public.message_threads(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  file_name        text not null,
  storage_path     text not null,
  mime_type        text,
  size_bytes       bigint,
  created_at       timestamptz not null default now()
);

create index if not exists portal_message_attachments_message_id_idx
  on public.portal_message_attachments (message_id);

create index if not exists portal_message_attachments_thread_id_idx
  on public.portal_message_attachments (thread_id);

alter table public.portal_message_attachments enable row level security;

create policy "Platform admins manage portal_message_attachments"
  on public.portal_message_attachments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage portal_message_attachments"
  on public.portal_message_attachments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Participants read portal_message_attachments"
  on public.portal_message_attachments for select to authenticated
  using (public.user_can_access_message_thread(thread_id));

create policy "Participants insert portal_message_attachments"
  on public.portal_message_attachments for insert to authenticated
  with check (public.user_can_access_message_thread(thread_id));

-- Private bucket for message attachments.
-- Path: {organization_id}/message-threads/{thread_id}/{message_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-message-files',
  'portal-message-files',
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

create or replace function public.portal_message_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.portal_message_storage_thread_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Platform admins manage portal-message-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'portal-message-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'portal-message-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage portal-message-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'portal-message-files'
    and public.user_is_org_admin(public.portal_message_storage_org_id(name))
  )
  with check (
    bucket_id = 'portal-message-files'
    and (storage.foldername(name))[2] = 'message-threads'
    and public.user_is_org_admin(public.portal_message_storage_org_id(name))
  );

create policy "Participants read portal-message-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portal-message-files'
    and public.user_can_access_message_thread(
      public.portal_message_storage_thread_id(name)
    )
  );

create policy "Participants insert portal-message-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portal-message-files'
    and (storage.foldername(name))[2] = 'message-threads'
    and public.user_can_access_message_thread(
      public.portal_message_storage_thread_id(name)
    )
  );
