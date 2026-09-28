-- Link Rachael Sparhawk admin + teacher portal logins (Rooted Meadows).
-- Date: 2026-09-27
-- Run after: add_organization_portal_account_links_2026_09_27.sql
--
-- Primary login: admin@rootedmeadowswaldorf.org
-- Also links: sparhawk.r@rootedmeadows.org (teacher/staff)
-- Optional third member: rakel.sparhawk@gmail.com (legacy parent membership only)

begin;

do $$
declare
  v_org_id          uuid;
  v_group_id        uuid;
  v_admin_user_id   uuid := '161d23c6-4090-4d74-8bbe-dd01d90b3d47';
  v_teacher_user_id uuid := '19f5d9fd-9bc1-4884-ba3a-f6a8e7232bb5';
  v_rakel_user_id   uuid := 'cd5af2c9-d05f-4e03-9042-b7620e406d34';
begin
  select id into v_org_id from public.organizations where slug = 'rooted-meadows';
  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  select g.id into v_group_id
  from public.organization_portal_account_link_groups g
  where g.organization_id = v_org_id
    and g.primary_user_id = v_admin_user_id
  limit 1;

  if v_group_id is null then
    insert into public.organization_portal_account_link_groups (
      organization_id,
      primary_user_id,
      label
    ) values (
      v_org_id,
      v_admin_user_id,
      'Rachael Sparhawk'
    )
    returning id into v_group_id;
  end if;

  insert into public.organization_portal_account_link_members (
    group_id,
    organization_id,
    user_id
  ) values
    (v_group_id, v_org_id, v_admin_user_id),
    (v_group_id, v_org_id, v_teacher_user_id),
    (v_group_id, v_org_id, v_rakel_user_id)
  on conflict (organization_id, user_id) do nothing;

  update public.organization_portal_account_link_groups
  set primary_user_id = v_admin_user_id,
      label = coalesce(label, 'Rachael Sparhawk'),
      updated_at = now()
  where id = v_group_id;

  raise notice 'Portal account link group % ready for Rooted Meadows.', v_group_id;
end $$;

commit;

-- Optional: disable redundant parent membership after Rachael uses admin@ exclusively.
-- update public.organization_memberships
-- set status = 'disabled', updated_at = now()
-- where user_id = 'cd5af2c9-d05f-4e03-9042-b7620e406d34'
--   and organization_id = (select id from public.organizations where slug = 'rooted-meadows')
--   and role = 'parent';
