-- Cleanup partial apply signup for julius.staffroom@gmail.com @ rooted-meadows-demo
-- Run in Supabase SQL Editor, then delete auth user in Dashboard if still present.
-- Date: 2026-09-03

do $$
declare
  v_email text := 'julius.staffroom@gmail.com';
  v_slug text := 'rooted-meadows-demo';
  v_user_id uuid;
  v_org_id uuid;
begin
  select id into v_user_id from auth.users where email = v_email;
  select id into v_org_id from public.organizations where slug = v_slug;

  if v_org_id is null then
    raise exception 'Organization % not found', v_slug;
  end if;

  -- Applications for this user at this org
  delete from public.applications
  where organization_id = v_org_id
    and created_by_user_id = v_user_id;

  -- Guardian + family (if any)
  delete from public.guardians
  where organization_id = v_org_id
    and (user_id = v_user_id or email = v_email);

  delete from public.families
  where organization_id = v_org_id
    and primary_email = v_email
    and not exists (
      select 1 from public.guardians g where g.family_id = families.id
    );

  -- Membership
  delete from public.organization_memberships
  where organization_id = v_org_id
    and user_id = v_user_id;

  raise notice 'Cleaned admission rows for % at %. Auth user id: %',
    v_email, v_slug, v_user_id;
end $$;
