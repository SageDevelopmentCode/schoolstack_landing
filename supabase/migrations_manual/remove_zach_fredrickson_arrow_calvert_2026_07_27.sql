-- Remove Zach Fredrickson (Parent 2) from Arrow Calvert application records.
-- rooted-meadows | Date: 2026-07-27
-- Reason: Parents divorced; Zach has no legal custody.
-- Idempotent: safe to re-run.
--
-- Zach was never inserted into public.guardians — only Parent 2 (p2f*) response
-- fields on the imported application. Hayley Calvert remains the sole guardian.
--
-- After running, verify with the SELECT queries at the bottom.

begin;

-- 1) Strip all Parent 2 response fields from Arrow's application
update public.applications a
set responses = (
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from jsonb_each(a.responses)
  where key not like 'p2f%'
)
where a.id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01'
  and exists (
    select 1 from jsonb_each(a.responses) kv where kv.key like 'p2f%'
  );

-- 2) Update Hayley's marital status to divorced
update public.applications a
set responses = jsonb_set(a.responses, '{p1f010d0e1f2}', '"divorced"')
where a.id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01'
  and a.responses->>'p1f010d0e1f2' is distinct from 'divorced';

-- 3) Belt-and-suspenders: ensure Zach has no portal access (already disabled)
update public.organization_memberships om
set status = 'disabled'
from public.organizations o, auth.users u
where om.organization_id = o.id
  and om.user_id = u.id
  and o.slug = 'rooted-meadows'
  and u.email = 'zfredrickson07@gmail.com'
  and om.status is distinct from 'disabled';

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY — expect 0 Parent 2 keys, divorced marital status, only Hayley guardian
-- ═══════════════════════════════════════════════════════════════════════════════

select
  a.responses->>'p1f010d0e1f2' as parent1_marital_status,
  (select count(*) from jsonb_each(a.responses) kv where kv.key like 'p2f%') as parent2_field_count
from public.applications a
where a.id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01';

select g.first_name, g.last_name, g.email, g.user_id
from public.guardians g
join public.families f on f.id = g.family_id
where f.id = 'a1c2d3e4-f5a6-4789-b012-3456789abcde';

select o.slug, u.email, om.role, om.status
from public.organization_memberships om
join public.organizations o on o.id = om.organization_id
join auth.users u on u.id = om.user_id
where u.email in ('canidcafe@gmail.com', 'zfredrickson07@gmail.com')
  and o.slug = 'rooted-meadows';
