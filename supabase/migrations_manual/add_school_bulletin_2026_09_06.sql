-- Promoted to supabase/migrations/20260906_add_school_bulletin.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.school_bulletin_posts (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  title            text not null check (char_length(trim(title)) > 0),
  body             text not null default '',
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  audience         text not null default 'school_wide'
                     check (audience in ('school_wide', 'parents', 'teachers', 'program')),
  program_id       uuid references public.programs(id) on delete set null,
  published_at     timestamptz,
  expires_at       timestamptz,
  created_by       uuid references public.staff_members(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint school_bulletin_posts_program_audience check (
    (audience = 'program' and program_id is not null)
    or (audience in ('school_wide', 'teachers') and program_id is null)
    or (audience = 'parents')
  )
);

create index if not exists school_bulletin_posts_org_status_published_idx
  on public.school_bulletin_posts (organization_id, status, published_at desc);

create index if not exists school_bulletin_posts_org_program_idx
  on public.school_bulletin_posts (organization_id, program_id);

drop trigger if exists on_school_bulletin_posts_updated on public.school_bulletin_posts;
create trigger on_school_bulletin_posts_updated
  before update on public.school_bulletin_posts
  for each row execute procedure public.handle_updated_at();

create table if not exists public.school_bulletin_attachments (
  id               uuid primary key default gen_random_uuid(),
  post_id          uuid not null references public.school_bulletin_posts(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  file_name        text not null,
  storage_path     text not null,
  mime_type        text,
  size_bytes       bigint,
  created_at       timestamptz not null default now()
);

create index if not exists school_bulletin_attachments_post_id_idx
  on public.school_bulletin_attachments (post_id);

create or replace function public.school_bulletin_post_is_active(
  p_status text,
  p_published_at timestamptz,
  p_expires_at timestamptz
)
returns boolean
language sql
stable
as $$
  select p_status = 'published'
    and (p_published_at is null or p_published_at <= now())
    and (p_expires_at is null or p_expires_at > now());
$$;

alter table public.school_bulletin_posts enable row level security;
alter table public.school_bulletin_attachments enable row level security;

drop policy if exists "Platform admins manage school_bulletin_posts" on public.school_bulletin_posts;
create policy "Platform admins manage school_bulletin_posts"
  on public.school_bulletin_posts for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage school_bulletin_posts" on public.school_bulletin_posts;
create policy "Org admins manage school_bulletin_posts"
  on public.school_bulletin_posts for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Enrolled parents read active school_bulletin_posts" on public.school_bulletin_posts;
create policy "Enrolled parents read active school_bulletin_posts"
  on public.school_bulletin_posts for select to authenticated
  using (
    public.user_has_enrolled_parent_access(organization_id)
    and public.school_bulletin_post_is_active(status, published_at, expires_at)
    and audience in ('school_wide', 'parents', 'program')
  );

drop policy if exists "Staff read active school_bulletin_posts" on public.school_bulletin_posts;
create policy "Staff read active school_bulletin_posts"
  on public.school_bulletin_posts for select to authenticated
  using (
    public.user_is_staff_org_member(organization_id)
    and public.school_bulletin_post_is_active(status, published_at, expires_at)
    and audience in ('school_wide', 'teachers')
  );

drop policy if exists "Platform admins manage school_bulletin_attachments" on public.school_bulletin_attachments;
create policy "Platform admins manage school_bulletin_attachments"
  on public.school_bulletin_attachments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage school_bulletin_attachments" on public.school_bulletin_attachments;
create policy "Org admins manage school_bulletin_attachments"
  on public.school_bulletin_attachments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Readers select school_bulletin_attachments" on public.school_bulletin_attachments;
create policy "Readers select school_bulletin_attachments"
  on public.school_bulletin_attachments for select to authenticated
  using (
    exists (
      select 1
      from public.school_bulletin_posts p
      where p.id = post_id
        and (
          public.user_is_org_admin(p.organization_id)
          or (
            public.user_has_enrolled_parent_access(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audience in ('school_wide', 'parents', 'program')
          )
          or (
            public.user_is_staff_org_member(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audience in ('school_wide', 'teachers')
          )
        )
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-bulletin-files',
  'school-bulletin-files',
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

create or replace function public.school_bulletin_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.school_bulletin_storage_post_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

drop policy if exists "Platform admins manage school-bulletin-files storage" on storage.objects;
create policy "Platform admins manage school-bulletin-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-bulletin-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'school-bulletin-files'
    and public.is_platform_admin()
  );

drop policy if exists "Org admins manage school-bulletin-files storage" on storage.objects;
create policy "Org admins manage school-bulletin-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-bulletin-files'
    and public.user_is_org_admin(public.school_bulletin_storage_org_id(name))
  )
  with check (
    bucket_id = 'school-bulletin-files'
    and (storage.foldername(name))[2] = 'bulletin-posts'
    and public.user_is_org_admin(public.school_bulletin_storage_org_id(name))
  );

drop policy if exists "Readers read school-bulletin-files storage" on storage.objects;
create policy "Readers read school-bulletin-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'school-bulletin-files'
    and exists (
      select 1
      from public.school_bulletin_posts p
      where p.id = public.school_bulletin_storage_post_id(name)
        and (
          public.user_is_org_admin(p.organization_id)
          or (
            public.user_has_enrolled_parent_access(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audience in ('school_wide', 'parents', 'program')
          )
          or (
            public.user_is_staff_org_member(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audience in ('school_wide', 'teachers')
          )
        )
    )
  );

drop policy if exists "Org admins insert school-bulletin-files storage" on storage.objects;
create policy "Org admins insert school-bulletin-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-bulletin-files'
    and (storage.foldername(name))[2] = 'bulletin-posts'
    and public.user_is_org_admin(public.school_bulletin_storage_org_id(name))
  );

drop policy if exists "Org admins delete school-bulletin-files storage" on storage.objects;
create policy "Org admins delete school-bulletin-files storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-bulletin-files'
    and public.user_is_org_admin(public.school_bulletin_storage_org_id(name))
  );
