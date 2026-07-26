-- Remove Ritchie + Olson families from rooted-meadows-demo and link parents to rooted-meadows.
-- Students: Olivia Ritchie, Joseph Olson
-- Parents: francescathemaker@gmail.com, bolsonmft@gmail.com
-- Date: 2026-07-23
--
-- Run in Supabase SQL Editor. Idempotent: safe to re-run (deletes are no-ops if already removed;
-- updates and membership inserts use on conflict / only affect matching rows).
--
-- After running, verify with the SELECT at the bottom.

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Remove from rooted-meadows-demo
-- ═══════════════════════════════════════════════════════════════════════════════

begin;

-- Demo applications (cascades application_payments)
delete from public.applications a
using public.organizations o, public.students s
where a.organization_id = o.id
  and o.slug = 'rooted-meadows-demo'
  and a.student_id = s.id
  and (
    (s.first_name = 'Olivia' and s.last_name = 'Ritchie')
    or (s.first_name = 'Joseph' and s.last_name = 'Olson')
  );

-- Parent memberships in demo org
delete from public.organization_memberships om
using public.organizations o
where om.organization_id = o.id
  and o.slug = 'rooted-meadows-demo'
  and om.user_id in (
    select id from auth.users
    where email in ('francescathemaker@gmail.com', 'bolsonmft@gmail.com')
  );

-- Demo families (cascades guardians + students)
delete from public.families f
using public.organizations o
where f.organization_id = o.id
  and o.slug = 'rooted-meadows-demo'
  and f.name in ('Ritchie Family', 'Olson Family');

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Link parent portal accounts to rooted-meadows (production)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Olivia Ritchie / francescathemaker@gmail.com
-- auth.users id: 6c56d7da-73b6-4f19-aef9-d8d325189bcc

begin;

update public.guardians g
set user_id = '6c56d7da-73b6-4f19-aef9-d8d325189bcc'
from public.organizations o
where g.organization_id = o.id
  and o.slug = 'rooted-meadows'
  and g.email = 'francescathemaker@gmail.com';

update public.applications a
set created_by_user_id = '6c56d7da-73b6-4f19-aef9-d8d325189bcc'
from public.organizations o, public.students s
where a.organization_id = o.id
  and o.slug = 'rooted-meadows'
  and a.student_id = s.id
  and s.first_name = 'Olivia' and s.last_name = 'Ritchie';

insert into public.organization_memberships (organization_id, user_id, role, status)
select o.id, '6c56d7da-73b6-4f19-aef9-d8d325189bcc', 'parent', 'active'
from public.organizations o where o.slug = 'rooted-meadows'
on conflict (organization_id, user_id) do nothing;

commit;

-- Joseph Olson / bolsonmft@gmail.com
-- auth.users id: fbe672aa-e251-4eb5-abf2-901a6fb237ed

begin;

update public.guardians g
set user_id = 'fbe672aa-e251-4eb5-abf2-901a6fb237ed'
from public.organizations o
where g.organization_id = o.id
  and o.slug = 'rooted-meadows'
  and g.email = 'bolsonmft@gmail.com';

update public.applications a
set created_by_user_id = 'fbe672aa-e251-4eb5-abf2-901a6fb237ed'
from public.organizations o, public.students s
where a.organization_id = o.id
  and o.slug = 'rooted-meadows'
  and a.student_id = s.id
  and s.first_name = 'Joseph' and s.last_name = 'Olson';

insert into public.organization_memberships (organization_id, user_id, role, status)
select o.id, 'fbe672aa-e251-4eb5-abf2-901a6fb237ed', 'parent', 'active'
from public.organizations o where o.slug = 'rooted-meadows'
on conflict (organization_id, user_id) do nothing;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Expect: only rooted-meadows rows with user_id set; no rooted-meadows-demo rows
select o.slug, f.name, g.email, g.user_id
from public.guardians g
join public.families f on f.id = g.family_id
join public.organizations o on o.id = g.organization_id
where g.email in ('francescathemaker@gmail.com', 'bolsonmft@gmail.com')
order by o.slug;

-- Expect: parent memberships only in rooted-meadows
select o.slug, om.role, om.status, u.email
from public.organization_memberships om
join public.organizations o on o.id = om.organization_id
join auth.users u on u.id = om.user_id
where u.email in ('francescathemaker@gmail.com', 'bolsonmft@gmail.com')
order by u.email, o.slug;
