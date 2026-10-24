-- Seed rooted-meadows-demo co-op portal test parent (Kindergarten Co-op only).
-- Paste into Supabase SQL Editor and run the ENTIRE file. Safe to re-run (idempotent).
-- Date: 2026-10-22
--
-- Demo account:
--   Email:    coop-portal-test@example.invalid
--   Password: ##TestCoOp$$
--
-- Sign in at:
--   /school/rooted-meadows-demo/parent/sign-in
-- Co-op portal:
--   /school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal

-- ── Step 1: Auth user (email confirmed, password login) ─────────────────────

update auth.users
set
  encrypted_password = extensions.crypt($pwd$##TestCoOp$$$pwd$, extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = 'coop-portal-test@example.invalid';

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  is_sso_user,
  is_anonymous
)
select
  ids.uid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'coop-portal-test@example.invalid',
  extensions.crypt($pwd$##TestCoOp$$$pwd$, extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']::text[]),
  jsonb_build_object(
    'sub', ids.uid::text,
    'email', 'coop-portal-test@example.invalid',
    'first_name', 'Coop',
    'last_name', 'Tester',
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  '',
  '',
  '',
  '',
  false,
  false
from (select gen_random_uuid() as uid) ids
where not exists (
  select 1
  from auth.users
  where lower(email) = 'coop-portal-test@example.invalid'
);

insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object(
    'sub', u.id::text,
    'email', 'coop-portal-test@example.invalid',
    'first_name', 'Coop',
    'last_name', 'Tester',
    'email_verified', true,
    'phone_verified', false
  ),
  null,
  now(),
  now()
from auth.users u
where lower(u.email) = 'coop-portal-test@example.invalid'
  and not exists (
    select 1
    from auth.identities i
    where i.user_id = u.id
      and i.provider = 'email'
  );

update auth.identities i
set
  identity_data = jsonb_build_object(
    'sub', u.id::text,
    'email', 'coop-portal-test@example.invalid',
    'first_name', 'Coop',
    'last_name', 'Tester',
    'email_verified', true,
    'phone_verified', false
  ),
  updated_at = now()
from auth.users u
where lower(u.email) = 'coop-portal-test@example.invalid'
  and i.user_id = u.id
  and i.provider = 'email';

-- ── Step 2: Organization membership ─────────────────────────────────────────

insert into public.organization_memberships (
  organization_id,
  user_id,
  role,
  status
)
select
  o.id,
  u.id,
  'parent',
  'active'
from public.organizations o
join auth.users u on lower(u.email) = 'coop-portal-test@example.invalid'
where o.slug = 'rooted-meadows-demo'
on conflict (organization_id, user_id) do update
set
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

-- ── Step 3: Family ────────────────────────────────────────────────────────────

insert into public.families (
  organization_id,
  name,
  primary_email
)
select
  o.id,
  'Coop Portal Test Family',
  'coop-portal-test@example.invalid'
from public.organizations o
where o.slug = 'rooted-meadows-demo'
  and not exists (
    select 1
    from public.families f
    where f.organization_id = o.id
      and lower(f.primary_email) = 'coop-portal-test@example.invalid'
  );

-- ── Step 4: Guardian ────────────────────────────────────────────────────────

insert into public.guardians (
  organization_id,
  family_id,
  user_id,
  first_name,
  last_name,
  email,
  relationship
)
select
  o.id,
  f.id,
  u.id,
  'Coop',
  'Tester',
  'coop-portal-test@example.invalid',
  'parent'
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
join auth.users u on lower(u.email) = 'coop-portal-test@example.invalid'
where o.slug = 'rooted-meadows-demo'
  and not exists (
    select 1
    from public.guardians g
    where g.organization_id = o.id
      and g.user_id = u.id
  );

update public.guardians g
set
  family_id = f.id,
  first_name = 'Coop',
  last_name = 'Tester',
  email = 'coop-portal-test@example.invalid',
  relationship = 'parent',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
join auth.users u on lower(u.email) = 'coop-portal-test@example.invalid'
where o.slug = 'rooted-meadows-demo'
  and g.organization_id = o.id
  and g.user_id = u.id;

-- ── Step 5: Student, co-op enrollment, co-op application ────────────────────

insert into public.students (
  organization_id,
  family_id,
  first_name,
  last_name,
  date_of_birth,
  grade,
  status
)
select
  o.id,
  f.id,
  'Sam',
  'Coop',
  '2020-06-01'::date,
  'k',
  'active'
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
where o.slug = 'rooted-meadows-demo'
  and not exists (
    select 1
    from public.students s
    where s.organization_id = o.id
      and s.family_id = f.id
      and s.first_name = 'Sam'
      and s.last_name = 'Coop'
  );

update public.students s
set
  date_of_birth = '2020-06-01'::date,
  grade = 'k',
  status = 'active',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
where o.slug = 'rooted-meadows-demo'
  and s.organization_id = o.id
  and s.family_id = f.id
  and s.first_name = 'Sam'
  and s.last_name = 'Coop';

insert into public.enrollments (
  organization_id,
  student_id,
  program_id,
  status
)
select
  o.id,
  s.id,
  p.id,
  'enrolled'
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.first_name = 'Sam'
 and s.last_name = 'Coop'
join public.programs p
  on p.organization_id = o.id
 and p.portal_slug = 'kindergarten-co-op'
where o.slug = 'rooted-meadows-demo'
on conflict (student_id, program_id) do update
set
  status = 'enrolled',
  updated_at = now();

insert into public.applications (
  organization_id,
  program_id,
  form_version_id,
  family_id,
  student_id,
  primary_guardian_id,
  status,
  responses,
  submitted_at,
  created_by_user_id
)
select
  o.id,
  p.id,
  afv.id,
  f.id,
  s.id,
  g.id,
  'enrolled',
  jsonb_build_object(
    '__seed_source', 'rooted_meadows_demo_coop_test_parent_2026_10_22',
    'student_first_name', s.first_name,
    'student_last_name', s.last_name,
    'student_date_of_birth', s.date_of_birth::text,
    'student_grade', s.grade
  ),
  now(),
  u.id
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
join auth.users u on lower(u.email) = 'coop-portal-test@example.invalid'
join public.guardians g
  on g.organization_id = o.id
 and g.user_id = u.id
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.first_name = 'Sam'
 and s.last_name = 'Coop'
join public.programs p
  on p.organization_id = o.id
 and p.portal_slug = 'kindergarten-co-op'
join public.application_form_versions afv
  on afv.organization_id = o.id
 and afv.program_id = p.id
 and afv.public_slug = 'apply-kindergarten-co-op'
 and afv.status = 'published'
where o.slug = 'rooted-meadows-demo'
  and not exists (
    select 1
    from public.applications a
    where a.organization_id = o.id
      and a.student_id = s.id
      and a.program_id = p.id
  );

update public.applications a
set
  family_id = f.id,
  primary_guardian_id = g.id,
  program_id = p.id,
  form_version_id = afv.id,
  status = 'enrolled',
  submitted_at = coalesce(a.submitted_at, now()),
  created_by_user_id = u.id,
  responses = jsonb_build_object(
    '__seed_source', 'rooted_meadows_demo_coop_test_parent_2026_10_22',
    'student_first_name', s.first_name,
    'student_last_name', s.last_name,
    'student_date_of_birth', s.date_of_birth::text,
    'student_grade', s.grade
  ),
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'coop-portal-test@example.invalid'
join auth.users u on lower(u.email) = 'coop-portal-test@example.invalid'
join public.guardians g
  on g.organization_id = o.id
 and g.user_id = u.id
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.first_name = 'Sam'
 and s.last_name = 'Coop'
join public.programs p
  on p.organization_id = o.id
 and p.portal_slug = 'kindergarten-co-op'
join public.application_form_versions afv
  on afv.organization_id = o.id
 and afv.program_id = p.id
 and afv.public_slug = 'apply-kindergarten-co-op'
 and afv.status = 'published'
where o.slug = 'rooted-meadows-demo'
  and a.organization_id = o.id
  and a.student_id = s.id
  and a.program_id = p.id;

-- ── Verification (run separately after seed) ────────────────────────────────

-- select
--   u.email,
--   u.email_confirmed_at is not null as email_confirmed,
--   u.encrypted_password is not null as has_password
-- from auth.users u
-- where lower(u.email) = 'coop-portal-test@example.invalid';

-- select
--   o.slug,
--   om.role,
--   om.status as membership_status,
--   g.first_name || ' ' || g.last_name as guardian_name,
--   f.name as family_name
-- from public.guardians g
-- join public.families f on f.id = g.family_id
-- join public.organizations o on o.id = g.organization_id
-- join public.organization_memberships om
--   on om.organization_id = o.id
--  and om.user_id = g.user_id
-- where o.slug = 'rooted-meadows-demo'
--   and lower(g.email) = 'coop-portal-test@example.invalid';

-- select
--   s.first_name,
--   s.last_name,
--   p.name as program,
--   e.status as enrollment_status,
--   a.status as application_status,
--   afv.title as form_title
-- from public.guardians g
-- join public.families f on f.id = g.family_id
-- join public.students s on s.family_id = f.id
-- join public.enrollments e on e.student_id = s.id
-- join public.programs p on p.id = e.program_id
-- left join public.applications a
--   on a.student_id = s.id
--  and a.program_id = p.id
-- left join public.application_form_versions afv on afv.id = a.form_version_id
-- join public.organizations o on o.id = g.organization_id
-- where o.slug = 'rooted-meadows-demo'
--   and lower(g.email) = 'coop-portal-test@example.invalid'
-- order by p.name;
