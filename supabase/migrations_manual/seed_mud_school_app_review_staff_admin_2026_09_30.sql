-- Seed Mud School App Review demo staff + school admin accounts.
-- Paste into Supabase SQL Editor (production) and run the ENTIRE file. Idempotent.
-- Date: 2026-09-30
--
-- Prerequisites: Mud School (slug mud-school) exists and is live; run
-- seed_mud_school_test_parent_2026_09_23.sql first for the parent demo family.
--
-- Demo credentials (MudKitchen mobile — select Mud School, then "Use password instead"):
--
--   Parent:       testparent@gmail.com   / ##testparent$$
--   Staff:        testteacher@gmail.com  / ##testteacher$$
--   School admin: testadmin@gmail.com    / ##testadmin$$
--
-- Web parent portal: /school/mud-school/parent/portal

-- ── Step 1: Auth users (email confirmed, password login) ────────────────────

-- testteacher@gmail.com / ##testteacher$$

update auth.users
set
  encrypted_password = extensions.crypt($pwd$##testteacher$$$pwd$, extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = 'testteacher@gmail.com';

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
  'testteacher@gmail.com',
  extensions.crypt($pwd$##testteacher$$$pwd$, extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']::text[]),
  jsonb_build_object(
    'sub', ids.uid::text,
    'email', 'testteacher@gmail.com',
    'first_name', 'Test',
    'last_name', 'Teacher',
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
  where lower(email) = 'testteacher@gmail.com'
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
    'email', 'testteacher@gmail.com',
    'first_name', 'Test',
    'last_name', 'Teacher',
    'email_verified', true,
    'phone_verified', false
  ),
  null,
  now(),
  now()
from auth.users u
where lower(u.email) = 'testteacher@gmail.com'
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
    'email', 'testteacher@gmail.com',
    'first_name', 'Test',
    'last_name', 'Teacher',
    'email_verified', true,
    'phone_verified', false
  ),
  updated_at = now()
from auth.users u
where lower(u.email) = 'testteacher@gmail.com'
  and i.user_id = u.id
  and i.provider = 'email';

-- testadmin@gmail.com / ##testadmin$$

update auth.users
set
  encrypted_password = extensions.crypt($pwd$##testadmin$$$pwd$, extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where lower(email) = 'testadmin@gmail.com';

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
  'testadmin@gmail.com',
  extensions.crypt($pwd$##testadmin$$$pwd$, extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']::text[]),
  jsonb_build_object(
    'sub', ids.uid::text,
    'email', 'testadmin@gmail.com',
    'first_name', 'Test',
    'last_name', 'Admin',
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
  where lower(email) = 'testadmin@gmail.com'
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
    'email', 'testadmin@gmail.com',
    'first_name', 'Test',
    'last_name', 'Admin',
    'email_verified', true,
    'phone_verified', false
  ),
  null,
  now(),
  now()
from auth.users u
where lower(u.email) = 'testadmin@gmail.com'
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
    'email', 'testadmin@gmail.com',
    'first_name', 'Test',
    'last_name', 'Admin',
    'email_verified', true,
    'phone_verified', false
  ),
  updated_at = now()
from auth.users u
where lower(u.email) = 'testadmin@gmail.com'
  and i.user_id = u.id
  and i.provider = 'email';

-- ── Step 2: Organization memberships ─────────────────────────────────────────

insert into public.organization_memberships (
  organization_id,
  user_id,
  role,
  status
)
select
  o.id,
  u.id,
  'teacher',
  'active'
from public.organizations o
join auth.users u on lower(u.email) = 'testteacher@gmail.com'
where o.slug = 'mud-school'
on conflict (organization_id, user_id) do update
set
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

insert into public.organization_memberships (
  organization_id,
  user_id,
  role,
  status
)
select
  o.id,
  u.id,
  'admin',
  'active'
from public.organizations o
join auth.users u on lower(u.email) = 'testadmin@gmail.com'
where o.slug = 'mud-school'
on conflict (organization_id, user_id) do update
set
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

-- ── Step 3: Staff member row (teacher portal) ───────────────────────────────

insert into public.staff_members (
  organization_id,
  user_id,
  first_name,
  last_name,
  email,
  role_title,
  status
)
select
  o.id,
  u.id,
  'Test',
  'Teacher',
  'testteacher@gmail.com',
  'Lead Teacher',
  'active'
from public.organizations o
join auth.users u on lower(u.email) = 'testteacher@gmail.com'
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.staff_members sm
    where sm.organization_id = o.id
      and sm.user_id = u.id
  );

update public.staff_members sm
set
  first_name = 'Test',
  last_name = 'Teacher',
  email = 'testteacher@gmail.com',
  role_title = 'Lead Teacher',
  status = 'active',
  updated_at = now()
from public.organizations o
join auth.users u on lower(u.email) = 'testteacher@gmail.com'
where o.slug = 'mud-school'
  and sm.organization_id = o.id
  and sm.user_id = u.id;

-- ── Step 4: Demo classroom + roster (optional but recommended for review) ───

insert into public.classrooms (
  organization_id,
  program_id,
  name,
  status
)
select
  o.id,
  p.id,
  'App Review · Primary',
  'open'
from public.organizations o
join lateral (
  select p2.id
  from public.programs p2
  where p2.organization_id = o.id
  order by p2.created_at asc
  limit 1
) p on true
where o.slug = 'mud-school'
  and not exists (
    select 1
    from public.classrooms c
    where c.organization_id = o.id
      and c.name = 'App Review · Primary'
  );

insert into public.classroom_staff_assignments (
  organization_id,
  classroom_id,
  staff_member_id,
  role
)
select
  o.id,
  c.id,
  sm.id,
  'lead'
from public.organizations o
join public.classrooms c
  on c.organization_id = o.id
 and c.name = 'App Review · Primary'
join public.staff_members sm
  on sm.organization_id = o.id
 and sm.status = 'active'
join auth.users u
  on u.id = sm.user_id
 and lower(u.email) = 'testteacher@gmail.com'
where o.slug = 'mud-school'
on conflict (classroom_id, staff_member_id) do nothing;

insert into public.enrollment_classrooms (
  organization_id,
  enrollment_id,
  classroom_id
)
select
  e.organization_id,
  e.id,
  c.id
from public.organizations o
join public.classrooms c
  on c.organization_id = o.id
 and c.name = 'App Review · Primary'
join public.enrollments e
  on e.organization_id = o.id
 and e.status = 'enrolled'
join public.students s
  on s.id = e.student_id
 and s.organization_id = o.id
join public.families f
  on f.id = s.family_id
 and f.organization_id = o.id
where o.slug = 'mud-school'
  and lower(f.primary_email) = 'testparent@gmail.com'
  and s.last_name = 'Test'
  and s.first_name in ('Alex', 'Maya')
on conflict (enrollment_id, classroom_id) do nothing;

-- ── Verification (run separately after seed) ────────────────────────────────

-- select
--   u.email,
--   u.email_confirmed_at is not null as email_confirmed,
--   u.encrypted_password is not null as has_password
-- from auth.users u
-- where lower(u.email) in (
--   'testparent@gmail.com',
--   'testteacher@gmail.com',
--   'testadmin@gmail.com'
-- )
-- order by u.email;

-- select
--   o.slug,
--   u.email,
--   om.role,
--   om.status
-- from public.organization_memberships om
-- join public.organizations o on o.id = om.organization_id
-- join auth.users u on u.id = om.user_id
-- where o.slug = 'mud-school'
--   and lower(u.email) in (
--     'testparent@gmail.com',
--     'testteacher@gmail.com',
--     'testadmin@gmail.com'
--   )
-- order by u.email;

-- select
--   u.email,
--   sm.role_title,
--   sm.status as staff_status,
--   c.name as classroom_name
-- from public.staff_members sm
-- join auth.users u on u.id = sm.user_id
-- join public.organizations o on o.id = sm.organization_id
-- left join public.classroom_staff_assignments csa
--   on csa.staff_member_id = sm.id
-- left join public.classrooms c on c.id = csa.classroom_id
-- where o.slug = 'mud-school'
--   and lower(u.email) = 'testteacher@gmail.com';
