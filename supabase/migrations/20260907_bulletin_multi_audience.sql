-- Bulletin multi-select audiences + program targets
-- Run after: 20260906_add_school_bulletin.sql

alter table public.school_bulletin_posts
  add column if not exists audiences text[] not null default '{school_wide}',
  add column if not exists program_ids uuid[] not null default '{}';

update public.school_bulletin_posts
set
  audiences = array[audience],
  program_ids = case
    when program_id is not null then array[program_id]
    else '{}'::uuid[]
  end
where audience is not null;

drop policy if exists "Enrolled parents read active school_bulletin_posts"
  on public.school_bulletin_posts;

drop policy if exists "Staff read active school_bulletin_posts"
  on public.school_bulletin_posts;

drop policy if exists "Readers select school_bulletin_attachments"
  on public.school_bulletin_attachments;

drop policy if exists "Readers read school-bulletin-files storage"
  on storage.objects;

alter table public.school_bulletin_posts
  drop constraint if exists school_bulletin_posts_program_audience;

alter table public.school_bulletin_posts
  drop column if exists audience,
  drop column if exists program_id;

drop index if exists public.school_bulletin_posts_org_program_idx;

create index if not exists school_bulletin_posts_org_program_ids_idx
  on public.school_bulletin_posts using gin (program_ids);

alter table public.school_bulletin_posts
  add constraint school_bulletin_posts_audiences_valid check (
    cardinality(audiences) >= 1
    and audiences <@ array['school_wide', 'parents', 'teachers', 'program']::text[]
  ),
  add constraint school_bulletin_posts_program_audiences check (
    not ('program' = any (audiences))
    or cardinality(program_ids) >= 1
  ),
  add constraint school_bulletin_posts_program_ids_scope check (
    not (audiences <@ array['school_wide', 'teachers']::text[])
    or program_ids = '{}'::uuid[]
  );

create policy "Enrolled parents read active school_bulletin_posts"
  on public.school_bulletin_posts for select to authenticated
  using (
    public.user_has_enrolled_parent_access(organization_id)
    and public.school_bulletin_post_is_active(status, published_at, expires_at)
    and audiences && array['school_wide', 'parents', 'program']::text[]
  );

create policy "Staff read active school_bulletin_posts"
  on public.school_bulletin_posts for select to authenticated
  using (
    public.user_is_staff_org_member(organization_id)
    and public.school_bulletin_post_is_active(status, published_at, expires_at)
    and audiences && array['school_wide', 'teachers']::text[]
  );

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
            and p.audiences && array['school_wide', 'parents', 'program']::text[]
          )
          or (
            public.user_is_staff_org_member(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audiences && array['school_wide', 'teachers']::text[]
          )
        )
    )
  );

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
            and p.audiences && array['school_wide', 'parents', 'program']::text[]
          )
          or (
            public.user_is_staff_org_member(p.organization_id)
            and public.school_bulletin_post_is_active(p.status, p.published_at, p.expires_at)
            and p.audiences && array['school_wide', 'teachers']::text[]
          )
        )
    )
  );
