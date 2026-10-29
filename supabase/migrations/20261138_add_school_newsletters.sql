-- School admin weekly newsletters (editions + org template)
-- Run after: 20261137_expand_push_notification_kinds.sql

create table if not exists public.school_newsletter_templates (
  organization_id  uuid primary key references public.organizations(id) on delete cascade,
  template         jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

drop trigger if exists on_school_newsletter_templates_updated on public.school_newsletter_templates;
create trigger on_school_newsletter_templates_updated
  before update on public.school_newsletter_templates
  for each row execute procedure public.handle_updated_at();

create table if not exists public.school_newsletter_editions (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  title               text not null default '',
  week                date not null,
  week_end            date,
  status              text not null default 'draft'
                        check (status in ('draft', 'published')),
  published_at        timestamptz,
  cover_storage_path  text,
  content             jsonb not null default '{}'::jsonb,
  created_by          uuid references public.staff_members(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists school_newsletter_editions_org_week_idx
  on public.school_newsletter_editions (organization_id, week desc);

create index if not exists school_newsletter_editions_org_status_idx
  on public.school_newsletter_editions (organization_id, status, updated_at desc);

drop trigger if exists on_school_newsletter_editions_updated on public.school_newsletter_editions;
create trigger on_school_newsletter_editions_updated
  before update on public.school_newsletter_editions
  for each row execute procedure public.handle_updated_at();

alter table public.school_newsletter_templates enable row level security;
alter table public.school_newsletter_editions enable row level security;

create policy "Platform admins manage school_newsletter_templates"
  on public.school_newsletter_templates for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage school_newsletter_templates"
  on public.school_newsletter_templates for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Platform admins manage school_newsletter_editions"
  on public.school_newsletter_editions for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage school_newsletter_editions"
  on public.school_newsletter_editions for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- Private bucket for newsletter cover + uploaded photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-newsletter-files',
  'school-newsletter-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.school_newsletter_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.school_newsletter_storage_edition_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Platform admins manage school-newsletter-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-newsletter-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'school-newsletter-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage school-newsletter-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-newsletter-files'
    and (storage.foldername(name))[2] = 'editions'
    and public.user_is_org_admin(public.school_newsletter_storage_org_id(name))
  )
  with check (
    bucket_id = 'school-newsletter-files'
    and (storage.foldername(name))[2] = 'editions'
    and public.user_is_org_admin(public.school_newsletter_storage_org_id(name))
  );

create policy "Org admins insert school-newsletter-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-newsletter-files'
    and (storage.foldername(name))[2] = 'editions'
    and public.user_is_org_admin(public.school_newsletter_storage_org_id(name))
  );

create policy "Org admins delete school-newsletter-files storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-newsletter-files'
    and public.user_is_org_admin(public.school_newsletter_storage_org_id(name))
  );
