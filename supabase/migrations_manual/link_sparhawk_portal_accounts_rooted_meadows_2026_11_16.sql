-- Link Rachael Sparhawk's three logins into one portal account-link group so any of them
-- (normally admin@) can switch between School admin, Staff portal and Parent portal on
-- web and mobile.
-- Date: 2026-11-16
-- Org: rooted-meadows (production)
--
-- RUN ONLY AFTER the "teacher portal prefers the linked teacher's staff record" code is
-- deployed (getTeacherPortalStaffMemberIdForUser). Before that deploy, the Staff portal
-- would open as admin@'s auto-created "School admin" staff record (no classes).
--
-- Verified production state (2026-11-16):
--   admin@rootedmeadowswaldorf.org  → 161d23c6-4090-4d74-8bbe-dd01d90b3d47 (owner; family guardian attached, see 2026-08-04 script)
--   sparhawk.r@rootedmeadows.org    → 19f5d9fd-9bc1-4884-ba3a-f6a8e7232bb5 (teacher; staff "Main Lesson Teacher" 9b76f682-…)
--   rakel.sparhawk@gmail.com        → cd5af2c9-d05f-4e03-9042-b7620e406d34 (parent membership)
--   No link group existed for any of them in rooted-meadows.
--
-- Same writes as Platform Admin → Account links (createLinkGroupWithMembers): one group row
-- with admin@ as primary + one member row per login. Primary stays admin@ so admin-side
-- identity (messages, publishing) keeps using the "School admin" staff record.
--
-- Run in the Supabase SQL Editor (not as a migration: production-only ids). All checks run
-- before any insert; if one fails, nothing is written.

begin;

do $$
declare
  v_org_slug        text := 'rooted-meadows';
  v_admin_user_id   uuid := '161d23c6-4090-4d74-8bbe-dd01d90b3d47';
  v_teacher_user_id uuid := '19f5d9fd-9bc1-4884-ba3a-f6a8e7232bb5';
  v_parent_user_id  uuid := 'cd5af2c9-d05f-4e03-9042-b7620e406d34';
  v_org_id          uuid;
  v_group_id        uuid;
  v_email           text;
  v_existing        int;
begin
  select id into v_org_id from public.organizations where slug = v_org_slug;
  if v_org_id is null then
    raise exception 'Organization % not found.', v_org_slug;
  end if;

  -- Each user id must still belong to the expected email.
  select email into v_email from auth.users where id = v_admin_user_id;
  if lower(coalesce(v_email, '')) <> 'admin@rootedmeadowswaldorf.org' then
    raise exception 'Unexpected email % for admin user %', v_email, v_admin_user_id;
  end if;

  select email into v_email from auth.users where id = v_teacher_user_id;
  if lower(coalesce(v_email, '')) <> 'sparhawk.r@rootedmeadows.org' then
    raise exception 'Unexpected email % for teacher user %', v_email, v_teacher_user_id;
  end if;

  select email into v_email from auth.users where id = v_parent_user_id;
  if lower(coalesce(v_email, '')) <> 'rakel.sparhawk@gmail.com' then
    raise exception 'Unexpected email % for parent user %', v_email, v_parent_user_id;
  end if;

  -- Memberships that give each login its portal.
  if not exists (
    select 1 from public.organization_memberships
    where organization_id = v_org_id and user_id = v_admin_user_id
      and status = 'active' and role in ('owner', 'admin')
  ) then
    raise exception 'admin@ lacks an active owner/admin membership on %.', v_org_slug;
  end if;

  if not exists (
    select 1 from public.organization_memberships
    where organization_id = v_org_id and user_id = v_teacher_user_id
      and status = 'active' and role in ('teacher', 'staff')
  ) then
    raise exception 'sparhawk.r@ lacks an active teacher/staff membership on %.', v_org_slug;
  end if;

  if not exists (
    select 1 from public.organization_memberships
    where organization_id = v_org_id and user_id = v_parent_user_id
      and status = 'active'
  ) then
    raise exception 'rakel.sparhawk@ lacks an active membership on %.', v_org_slug;
  end if;

  -- A login can be in only one link group per school (unique organization_id + user_id).
  select count(*) into v_existing
  from public.organization_portal_account_link_members
  where organization_id = v_org_id
    and user_id in (v_admin_user_id, v_teacher_user_id, v_parent_user_id);

  if v_existing > 0 then
    raise exception '% of these logins are already in a link group on %. Nothing written; review in Platform Admin → Account links.',
      v_existing, v_org_slug;
  end if;

  insert into public.organization_portal_account_link_groups (organization_id, primary_user_id, label)
  values (v_org_id, v_admin_user_id, 'Rachael Sparhawk')
  returning id into v_group_id;

  insert into public.organization_portal_account_link_members (group_id, organization_id, user_id)
  values
    (v_group_id, v_org_id, v_admin_user_id),
    (v_group_id, v_org_id, v_teacher_user_id),
    (v_group_id, v_org_id, v_parent_user_id);

  raise notice 'Created link group % (primary admin@) with admin@, sparhawk.r@, rakel.sparhawk@.', v_group_id;
end $$;

commit;

-- Post-run verification (expect 3 rows, is_primary true for admin@ only):
-- select g.id as group_id, g.label, u.email, (m.user_id = g.primary_user_id) as is_primary
-- from public.organization_portal_account_link_groups g
-- join public.organization_portal_account_link_members m on m.group_id = g.id
-- join auth.users u on u.id = m.user_id
-- join public.organizations o on o.id = g.organization_id
-- where o.slug = 'rooted-meadows'
--   and g.primary_user_id = '161d23c6-4090-4d74-8bbe-dd01d90b3d47'
-- order by is_primary desc, u.email;

-- Undo (removes the group; member rows cascade):
-- delete from public.organization_portal_account_link_groups
-- where organization_id = (select id from public.organizations where slug = 'rooted-meadows')
--   and primary_user_id = '161d23c6-4090-4d74-8bbe-dd01d90b3d47'
--   and label = 'Rachael Sparhawk';
