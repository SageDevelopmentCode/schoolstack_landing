-- Link Rachael Sparhawk's family (Olivia + Daniella) to admin@rootedmeadowswaldorf.org
-- so one login can access both school admin and family apply/parent views.
-- Date: 2026-08-04
-- Org: rooted-meadows (production)
--
-- Verified production state (2026-08-04):
--   admin@rootedmeadowswaldorf.org  → 161d23c6-4090-4d74-8bbe-dd01d90b3d47 (owner membership)
--   rakel.sparhawk@gmail.com        → cd5af2c9-d05f-4e03-9042-b7620e406d34 (parent membership, guardian linked)
--   Guardian Rachael                → c2d3e4f5-a6b7-4890-c123-456789abcdef
--   Applications Olivia / Daniella  → enrolling (enrollment checklist pending)
--
-- Run in Supabase SQL Editor after review. Idempotent where possible.

begin;

do $$
declare
  v_admin_user_id   uuid := '161d23c6-4090-4d74-8bbe-dd01d90b3d47';
  v_rakel_user_id   uuid := 'cd5af2c9-d05f-4e03-9042-b7620e406d34';
  v_org_slug        text := 'rooted-meadows';
  v_guardian_id     uuid := 'c2d3e4f5-a6b7-4890-c123-456789abcdef';
  v_family_id       uuid := 'b1c2d3e4-f5a6-4789-b012-3456789abc02';
  v_olivia_app_id   uuid := 'e4f5a6b7-c8d9-4012-e345-6789abcdef01';
  v_daniella_app_id uuid := '17c8d9e0-f1a2-4345-b678-9abcdef01234';
  v_admin_email     text;
  v_owner_count     int;
begin
  select email into v_admin_email
  from auth.users
  where id = v_admin_user_id;

  if v_admin_email is null then
    raise exception 'Admin auth user % not found. Create admin@rootedmeadowswaldorf.org first.', v_admin_user_id;
  end if;

  if lower(v_admin_email) <> 'admin@rootedmeadowswaldorf.org' then
    raise exception 'Unexpected admin email % for user %', v_admin_email, v_admin_user_id;
  end if;

  select count(*) into v_owner_count
  from public.organization_memberships om
  join public.organizations o on o.id = om.organization_id
  where om.user_id = v_admin_user_id
    and o.slug = v_org_slug
    and om.role in ('owner', 'admin')
    and om.status = 'active';

  if v_owner_count = 0 then
    raise exception 'Admin user lacks active owner/admin membership on %.', v_org_slug;
  end if;

  update public.guardians
  set user_id = v_admin_user_id,
      updated_at = now()
  where id = v_guardian_id
    and family_id = v_family_id;

  if not found then
    raise exception 'Guardian % not found for Sparhawk family.', v_guardian_id;
  end if;

  update public.applications
  set created_by_user_id = v_admin_user_id,
      updated_at = now()
  where id in (v_olivia_app_id, v_daniella_app_id)
    and family_id = v_family_id;

  -- Owner membership already grants admin portal access; guardian link grants family access.
  -- Do not insert a duplicate parent membership row (unique org_id + user_id).

  -- Optional: retire rakel@ parent membership once Rachael uses admin@ exclusively.
  -- update public.organization_memberships
  -- set status = 'disabled', updated_at = now()
  -- where user_id = v_rakel_user_id
  --   and organization_id = (select id from public.organizations where slug = v_org_slug)
  --   and role = 'parent';

  raise notice 'Linked Sparhawk guardian + applications to admin@ (%).', v_admin_user_id;
  raise notice 'Family comms emails unchanged (rakel.sparhawk@gmail.com on guardians/families rows).';
end $$;

commit;

-- Post-run verification:
-- select g.email, g.user_id, u.email as login_email
-- from public.guardians g
-- join auth.users u on u.id = g.user_id
-- where g.id = 'c2d3e4f5-a6b7-4890-c123-456789abcdef';
--
-- select a.id, s.first_name, a.created_by_user_id, u.email
-- from public.applications a
-- join public.students s on s.id = a.student_id
-- join auth.users u on u.id = a.created_by_user_id
-- where a.id in (
--   'e4f5a6b7-c8d9-4012-e345-6789abcdef01',
--   '17c8d9e0-f1a2-4345-b678-9abcdef01234'
-- );
