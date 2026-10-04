-- Mud School marketing persona: Mitchell family (fictional) for mobile carousel screenshots.
-- Paste into Supabase SQL Editor. Idempotent. Safe to re-run.
-- Date: 2026-10-04
--
-- Prerequisites:
--   - Organization slug mud-school exists
--   - seed_mud_school_test_parent_2026_09_23.sql has been run (testparent@gmail.com)
--
-- Keeps login email testparent@gmail.com (App Review). Updates display names only.
-- Target story (match web marketing demos): Sarah Mitchell, Emma & Liam, tuition $1,250 / $4,500.
--
-- Local/staging recommended. Optional on production if App Review should show Mitchell names.
--
-- Optional companion: seed_mud_school_homepage_demo_branding_2026_10_04.sql (portal colors → homepage demo greens).

-- ── Auth display name (parent home greeting) ─────────────────────────────────

update auth.users u
set
  raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'first_name', 'Sarah',
      'last_name', 'Mitchell',
      'email', 'testparent@gmail.com'
    ),
  updated_at = now()
where lower(u.email) = 'testparent@gmail.com';

update auth.identities i
set
  identity_data = jsonb_build_object(
    'sub', i.user_id::text,
    'email', 'testparent@gmail.com',
    'first_name', 'Sarah',
    'last_name', 'Mitchell',
    'email_verified', true,
    'phone_verified', false
  ),
  updated_at = now()
from auth.users u
where lower(u.email) = 'testparent@gmail.com'
  and i.user_id = u.id
  and i.provider = 'email';

-- ── Family & guardian ───────────────────────────────────────────────────────

update public.families f
set
  name = 'Mitchell family',
  updated_at = now()
from public.organizations o
where o.slug = 'mud-school'
  and f.organization_id = o.id
  and lower(f.primary_email) = 'testparent@gmail.com';

update public.guardians g
set
  first_name = 'Sarah',
  last_name = 'Mitchell',
  updated_at = now()
from public.organizations o
join auth.users u on lower(u.email) = 'testparent@gmail.com'
where o.slug = 'mud-school'
  and g.organization_id = o.id
  and g.user_id = u.id;

-- ── Students: Alex/Maya → Emma/Liam Mitchell ───────────────────────────────

update public.students s
set
  first_name = mapping.new_first,
  last_name = 'Mitchell',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
cross join (
  values
    ('Alex', 'Emma'),
    ('Maya', 'Liam')
) as mapping(old_first, new_first)
where o.slug = 'mud-school'
  and s.organization_id = o.id
  and s.family_id = f.id
  and s.first_name = mapping.old_first
  and s.last_name = 'Test';

-- If students were already renamed, normalize last name
update public.students s
set
  last_name = 'Mitchell',
  updated_at = now()
from public.organizations o
join public.families f
  on f.organization_id = o.id
 and lower(f.primary_email) = 'testparent@gmail.com'
where o.slug = 'mud-school'
  and s.organization_id = o.id
  and s.family_id = f.id
  and s.first_name in ('Emma', 'Liam')
  and s.last_name is distinct from 'Mitchell';

-- ── Application response JSON (enrollment UI labels) ───────────────────────────

update public.applications a
set
  responses = coalesce(a.responses, '{}'::jsonb)
    || jsonb_build_object(
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
join public.students s
  on s.organization_id = o.id
 and s.family_id = f.id
 and s.first_name in ('Emma', 'Liam')
where o.slug = 'mud-school'
  and a.organization_id = o.id
  and a.student_id = s.id;

-- ── Verification (optional) ─────────────────────────────────────────────────
-- select f.name, g.first_name, g.last_name, s.first_name, s.last_name
-- from public.organizations o
-- join public.families f on f.organization_id = o.id and lower(f.primary_email) = 'testparent@gmail.com'
-- join public.guardians g on g.family_id = f.id
-- join public.students s on s.family_id = f.id
-- where o.slug = 'mud-school';
