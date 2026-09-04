-- Co-op program curriculum PDF uploads (one file per program).
-- Run after: 20260853_add_message_thread_program_id.sql

create table if not exists public.program_coop_curriculum (
  program_id        uuid primary key references public.programs(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  storage_path      text not null,
  file_name         text not null,
  file_size_bytes   bigint,
  uploaded_by       uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists program_coop_curriculum_organization_id_idx
  on public.program_coop_curriculum (organization_id);

drop trigger if exists on_program_coop_curriculum_updated on public.program_coop_curriculum;
create trigger on_program_coop_curriculum_updated
  before update on public.program_coop_curriculum
  for each row execute procedure public.handle_updated_at();

alter table public.program_coop_curriculum enable row level security;

create or replace function public.program_coop_curriculum_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.program_coop_curriculum_storage_program_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create or replace function public.user_can_read_program_coop_curriculum(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.students s on s.id = e.student_id
    join public.guardians g on g.family_id = s.family_id
    where e.program_id = p_program_id
      and e.status = 'enrolled'
      and g.user_id = auth.uid()
  );
$$;

create policy "Platform admins manage program_coop_curriculum"
  on public.program_coop_curriculum for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage program_coop_curriculum"
  on public.program_coop_curriculum for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Staff read program_coop_curriculum"
  on public.program_coop_curriculum for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Enrolled guardians read program_coop_curriculum"
  on public.program_coop_curriculum for select to authenticated
  using (public.user_can_read_program_coop_curriculum(program_id));

-- Private bucket for co-op curriculum PDFs.
-- Path layout: {organization_id}/programs/{program_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'program-coop-curriculum-files',
  'program-coop-curriculum-files',
  false,
  104857600,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Platform admins manage program-coop-curriculum-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'program-coop-curriculum-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'program-coop-curriculum-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage program-coop-curriculum-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'program-coop-curriculum-files'
    and public.user_is_org_admin(public.program_coop_curriculum_storage_org_id(name))
  )
  with check (
    bucket_id = 'program-coop-curriculum-files'
    and (storage.foldername(name))[2] = 'programs'
    and public.user_is_org_admin(public.program_coop_curriculum_storage_org_id(name))
  );

create policy "Staff read program-coop-curriculum-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'program-coop-curriculum-files'
    and public.user_is_staff_org_member(public.program_coop_curriculum_storage_org_id(name))
  );

create policy "Enrolled guardians read program-coop-curriculum-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'program-coop-curriculum-files'
    and public.user_can_read_program_coop_curriculum(
      public.program_coop_curriculum_storage_program_id(name)
    )
  );
