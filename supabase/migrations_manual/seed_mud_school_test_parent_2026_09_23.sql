-- Seed Mud School test parent account with two enrolled children.
-- Paste into Supabase SQL Editor and run the ENTIRE file. Safe to re-run (idempotent).
-- Date: 2026-09-23
--
-- Credentials:
--   Email:    testparent@gmail.com
--   Password: ##testparent$$
--
-- Sign in at:
--   /school/mud-school/parent/portal

-- ── Step 1: Auth user (email confirmed, password login) ─────────────────────

update auth.users
set
  encrypted_password = extensions.crypt($pwd$##testparent$$$pwd$, extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = 'testparent@gmail.com';

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
  'testparent@gmail.com',
  extensions.crypt($pwd$##testparent$$$pwd$, extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']::text[]),
  jsonb_build_object(
    'sub', ids.uid::text,
    'email', 'testparent@gmail.com',
    'first_name', 'Test',
    'last_name', 'Parent',
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
  where lower(email) = 'testparent@gmail.com'
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
    'email', 'testparent@gmail.com',
    'first_name', 'Test',
    'last_name', 'Parent',
    'email_verified', true,
    'phone_verified', false
  ),
  null,
  now(),
  now()
from auth.users u
where lower(u.email) = 'testparent@gmail.com'
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
    'email', 'testparent@gmail.com',
    'first_name', 'Test',
    'last_name', 'Parent',
    'email_verified', true,
    'phone_verified', false
  ),
  updated_at = now()
from auth.users u
where lower(u.email) = 'testparent@gmail.com'
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
join auth.users u on lower(u.email) = 'testparent@gmail.com'
where o.slug = 'mud-school'
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
  'Test Parent Family',
  'testparent@gmail.com'
from public.organizations o
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.families f
    where f.organization_id = o.id
      and lower(f.primary_email) = 'testparent@gmail.com'
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
  'Test',
  'Parent',
  'testparent@gmail.com',
  'parent'
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
join auth.users u on lower(u.email) = 'testparent@gmail.com'
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.guardians g
    where g.organization_id = o.id
      and g.user_id = u.id
  );

update public.guardians g
set
  family_id = f.id,
  first_name = 'Test',
  last_name = 'Parent',
  email = 'testparent@gmail.com',
  relationship = 'parent',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
join auth.users u on lower(u.email) = 'testparent@gmail.com'
where o.slug = 'mud-school'
  and g.organization_id = o.id
  and g.user_id = u.id;

-- ── Step 5: Students, enrollments, applications (Alex + Maya) ───────────────

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
  child.first_name,
  child.last_name,
  child.date_of_birth,
  child.grade,
  'active'
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
cross join (
  values
    ('Alex', 'Test', '2018-05-15'::date, '2'),
    ('Maya', 'Test', '2020-09-10'::date, 'k')
) as child(first_name, last_name, date_of_birth, grade)
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.students s
    where s.organization_id = o.id
      and s.family_id = f.id
      and s.first_name = child.first_name
      and s.last_name = child.last_name
  );

update public.students s
set
  date_of_birth = child.date_of_birth,
  grade = child.grade,
  status = 'active',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
cross join (
  values
    ('Alex', 'Test', '2018-05-15'::date, '2'),
    ('Maya', 'Test', '2020-09-10'::date, 'k')
) as child(first_name, last_name, date_of_birth, grade)
where o.slug = 'mud-school'
  and s.organization_id = o.id
  and s.family_id = f.id
  and s.first_name = child.first_name
  and s.last_name = child.last_name;

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
 and lower(f.primary_email) = 'testparent@gmail.com'
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.last_name = 'Test'
 and s.first_name in ('Alex', 'Maya')
join lateral (
  select p2.id
  from public.programs p2
  where p2.organization_id = o.id
  order by p2.created_at asc
  limit 1
) p on true
where o.slug = 'mud-school'
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
 and lower(f.primary_email) = 'testparent@gmail.com'
join auth.users u on lower(u.email) = 'testparent@gmail.com'
join public.guardians g
  on g.organization_id = o.id
 and g.user_id = u.id
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.last_name = 'Test'
 and s.first_name in ('Alex', 'Maya')
join lateral (
  select p2.id
  from public.programs p2
  where p2.organization_id = o.id
  order by p2.created_at asc
  limit 1
) p on true
join lateral (
  select afv2.id
  from public.application_form_versions afv2
  where afv2.organization_id = o.id
    and afv2.status = 'published'
  order by afv2.version desc
  limit 1
) afv on true
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.applications a
    where a.organization_id = o.id
      and a.student_id = s.id
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
    'student_first_name', s.first_name,
    'student_last_name', s.last_name,
    'student_date_of_birth', s.date_of_birth::text,
    'student_grade', s.grade
  ),
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
join auth.users u on lower(u.email) = 'testparent@gmail.com'
join public.guardians g
  on g.organization_id = o.id
 and g.user_id = u.id
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.last_name = 'Test'
 and s.first_name in ('Alex', 'Maya')
join lateral (
  select p2.id
  from public.programs p2
  where p2.organization_id = o.id
  order by p2.created_at asc
  limit 1
) p on true
join lateral (
  select afv2.id
  from public.application_form_versions afv2
  where afv2.organization_id = o.id
    and afv2.status = 'published'
  order by afv2.version desc
  limit 1
) afv on true
where o.slug = 'mud-school'
  and a.organization_id = o.id
  and a.student_id = s.id;

-- ── Verification (run separately after seed) ────────────────────────────────

-- select
--   u.email,
--   u.email_confirmed_at is not null as email_confirmed,
--   u.encrypted_password is not null as has_password
-- from auth.users u
-- where lower(u.email) = 'testparent@gmail.com';

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
-- where o.slug = 'mud-school'
--   and lower(g.email) = 'testparent@gmail.com';

-- select
--   s.first_name,
--   s.last_name,
--   s.grade,
--   s.status as student_status,
--   e.status as enrollment_status,
--   a.status as application_status
-- from public.guardians g
-- join public.families f on f.id = g.family_id
-- join public.students s on s.family_id = f.id
-- join public.enrollments e on e.student_id = s.id
-- left join public.applications a
--   on a.student_id = s.id
--  and a.organization_id = g.organization_id
-- join public.organizations o on o.id = g.organization_id
-- where o.slug = 'mud-school'
--   and lower(g.email) = 'testparent@gmail.com'
-- order by s.first_name;
