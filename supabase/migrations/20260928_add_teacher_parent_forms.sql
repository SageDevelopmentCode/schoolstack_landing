-- Teacher parent forms (teacher-created forms for family signatures)
-- Run after: 20260927_harden_payment_transactions_meta_rpc.sql

create table if not exists public.teacher_parent_forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by_staff_member_id uuid not null references public.staff_members(id) on delete cascade,
  title text not null,
  description text not null default '',
  form_type text not null check (form_type in ('upload', 'builder')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  classroom_ids uuid[] not null default '{}',
  due_date date,
  require_signature boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  total_families integer not null default 0,
  signed_families integer not null default 0,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_parent_forms_org_staff_status_idx
  on public.teacher_parent_forms (organization_id, created_by_staff_member_id, status);

create index if not exists teacher_parent_forms_org_status_published_idx
  on public.teacher_parent_forms (organization_id, status, published_at desc nulls last);

create table if not exists public.teacher_parent_form_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  form_id uuid not null references public.teacher_parent_forms(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  student_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'signed', 'overdue')),
  responses jsonb not null default '{}'::jsonb,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (form_id, family_id)
);

create index if not exists teacher_parent_form_responses_form_idx
  on public.teacher_parent_form_responses (form_id);

create index if not exists teacher_parent_form_responses_family_idx
  on public.teacher_parent_form_responses (family_id, form_id);

drop trigger if exists on_teacher_parent_forms_updated on public.teacher_parent_forms;
create trigger on_teacher_parent_forms_updated
  before update on public.teacher_parent_forms
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_teacher_parent_form_responses_updated on public.teacher_parent_form_responses;
create trigger on_teacher_parent_form_responses_updated
  before update on public.teacher_parent_form_responses
  for each row execute procedure public.handle_updated_at();

alter table public.teacher_parent_forms enable row level security;
alter table public.teacher_parent_form_responses enable row level security;

create policy "Platform admins manage teacher_parent_forms"
  on public.teacher_parent_forms for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage teacher_parent_forms"
  on public.teacher_parent_forms for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org members read teacher_parent_forms"
  on public.teacher_parent_forms for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Platform admins manage teacher_parent_form_responses"
  on public.teacher_parent_form_responses for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage teacher_parent_form_responses"
  on public.teacher_parent_form_responses for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org members read teacher_parent_form_responses"
  on public.teacher_parent_form_responses for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read teacher_parent_form_responses for own family"
  on public.teacher_parent_form_responses for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

-- Private bucket for teacher parent form uploads (PDF/DOCX).
-- Path layout: {organization_id}/forms/{form_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'teacher-parent-form-files',
  'teacher-parent-form-files',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.teacher_parent_form_files_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create policy "Platform admins manage teacher-parent-form-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'teacher-parent-form-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'teacher-parent-form-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage teacher-parent-form-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'teacher-parent-form-files'
    and public.user_is_org_admin(public.teacher_parent_form_files_storage_org_id(name))
  )
  with check (
    bucket_id = 'teacher-parent-form-files'
    and (storage.foldername(name))[2] = 'forms'
    and public.user_is_org_admin(public.teacher_parent_form_files_storage_org_id(name))
  );

create policy "Staff read teacher-parent-form-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'teacher-parent-form-files'
    and public.user_is_staff_org_member(public.teacher_parent_form_files_storage_org_id(name))
  );
